import { subscribeToRoomEvents } from '@/lib/room-events';

interface RouteContext {
  params: Promise<{ ownerId: string }>;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request, context: RouteContext) {
  const { ownerId } = await context.params;

  if (!ownerId) {
    return new Response('Owner ID is required.', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const heartbeat = setInterval(() => {
        send('heartbeat', { timestamp: new Date().toISOString() });
      }, 25000);

      // Subscribe to room events (direct import)
      const unsubscribeRoomEvents = subscribeToRoomEvents(ownerId, (payload) => {
        send('room-assignment', payload);
      });

      send('connected', { ownerId, timestamp: new Date().toISOString() });

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribeRoomEvents();
        controller.close();
      }, { once: true });
    }
  });

  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
      'X-Accel-Buffering': 'no',
    },
  });
}

