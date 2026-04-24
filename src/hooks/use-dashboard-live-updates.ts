'use client';

import { useEffect, useEffectEvent } from 'react';

type UseDashboardLiveUpdatesOptions = {
  ownerId?: string;
  onUpdate: () => void;
  enabled?: boolean;
};

export function useDashboardLiveUpdates({
  ownerId,
  onUpdate,
  enabled = true,
}: UseDashboardLiveUpdatesOptions) {
  const handleUpdate = useEffectEvent(() => {
    onUpdate();
  });

  useEffect(() => {
    if (!enabled || !ownerId) {
      return;
    }

    // Meal events
    const mealSource = new EventSource(`/api/owner/${ownerId}/meal-events`);
    const mealOnUpdate = () => handleUpdate();
    mealSource.addEventListener('meal-update', mealOnUpdate);

    // Room events
    const roomSource = new EventSource(`/api/owner/${ownerId}/room-events`);
    const roomOnUpdate = () => handleUpdate();
    roomSource.addEventListener('room-assignment', roomOnUpdate);

    return () => {
      mealSource.removeEventListener('meal-update', mealOnUpdate);
      mealSource.close();
      
      roomSource.removeEventListener('room-assignment', roomOnUpdate);
      roomSource.close();
    };
  }, [ownerId, enabled, handleUpdate]);
}

