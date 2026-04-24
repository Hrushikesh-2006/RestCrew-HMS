export type MealEventAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'rsvp-updated'
  | 'notification-created';

export type MealEventPayload = {
  ownerId: string;
  action: MealEventAction;
  mealId?: string;
  timestamp: string;
};

type MealEventListener = (payload: MealEventPayload) => void;

const globalForMealEvents = globalThis as typeof globalThis & {
  mealEventListeners?: Map<string, Set<MealEventListener>>;
};

const listeners = globalForMealEvents.mealEventListeners ?? new Map<string, Set<MealEventListener>>();

if (!globalForMealEvents.mealEventListeners) {
  globalForMealEvents.mealEventListeners = listeners;
}

export function publishMealEvent(payload: Omit<MealEventPayload, 'timestamp'>) {
  const event: MealEventPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
  };

  const ownerListeners = listeners.get(payload.ownerId);

  if (!ownerListeners) {
    return event;
  }

  for (const listener of ownerListeners) {
    try {
      listener(event);
    } catch (error) {
      console.error('Meal event listener failed:', error);
    }
  }

  return event;
}

export function subscribeToMealEvents(ownerId: string, listener: MealEventListener) {
  let ownerListeners = listeners.get(ownerId);

  if (!ownerListeners) {
    ownerListeners = new Set<MealEventListener>();
    listeners.set(ownerId, ownerListeners);
  }

  ownerListeners.add(listener);

  return () => {
    const activeOwnerListeners = listeners.get(ownerId);

    if (!activeOwnerListeners) {
      return;
    }

    activeOwnerListeners.delete(listener);

    if (activeOwnerListeners.size === 0) {
      listeners.delete(ownerId);
    }
  };
}
