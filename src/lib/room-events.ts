export type RoomEventAction = 'assigned' | 'unassigned';

export type RoomEventPayload = {
  ownerId: string;
  action: RoomEventAction;
  studentId: string;
  roomId?: string;
  timestamp: string;
};

type RoomEventListener = (payload: RoomEventPayload) => void;

const globalForRoomEvents = globalThis as typeof globalThis & {
  roomEventListeners?: Map<string, Set<RoomEventListener>>;
};

const listeners = globalForRoomEvents.roomEventListeners ?? new Map<string, Set<RoomEventListener>>();

if (!globalForRoomEvents.roomEventListeners) {
  globalForRoomEvents.roomEventListeners = listeners;
}

export function publishRoomEvent(payload: Omit<RoomEventPayload, 'timestamp'>) {
  const event: RoomEventPayload = {
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
      console.error('Room event listener failed:', error);
    }
  }

  return event;
}

export function subscribeToRoomEvents(ownerId: string, listener: RoomEventListener) {
  let ownerListeners = listeners.get(ownerId);

  if (!ownerListeners) {
    ownerListeners = new Set<RoomEventListener>();
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

