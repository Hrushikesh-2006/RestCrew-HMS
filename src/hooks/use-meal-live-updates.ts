'use client';

import { useEffect, useEffectEvent } from 'react';

type UseMealLiveUpdatesOptions = {
  ownerId?: string;
  onMealUpdate: () => void;
  enabled?: boolean;
};

export function useMealLiveUpdates({
  ownerId,
  onMealUpdate,
  enabled = true,
}: UseMealLiveUpdatesOptions) {
  const handleMealUpdate = useEffectEvent(() => {
    onMealUpdate();
  });

  useEffect(() => {
    if (!enabled || !ownerId) {
      return;
    }

    const eventSource = new EventSource(`/api/owner/${ownerId}/meal-events`);
    const onUpdate = () => {
      handleMealUpdate();
    };

    eventSource.addEventListener('meal-update', onUpdate);

    return () => {
      eventSource.removeEventListener('meal-update', onUpdate);
      eventSource.close();
    };
  }, [enabled, ownerId]);
}
