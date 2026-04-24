import { subscribeToMealEvents } from '@/lib/meal-events';

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

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const cleanupCallbacks: Array<() => void> = [];
      const heartbeat = setInterval(() => {
        send('heartbeat', { timestamp: new Date().toISOString() });
      }, 25000);

      cleanupCallbacks.push(() => clearInterval(heartbeat));
      cleanupCallbacks.push(
        subscribeToMealEvents(ownerId, (payload) => {
          send('meal-update', payload);
        }),
      );
      cleanupCallbacks.push(() => {
        try {
          controller.close();
        } catch {
          // The stream may already be closed if the client disconnects mid-push.
        }
      });

      const cleanup = () => {
        while (cleanupCallbacks.length > 0) {
          const callback = cleanupCallbacks.pop();
          callback?.();
        }
      };

      send('connected', { ownerId, timestamp: new Date().toISOString() });
      request.signal.addEventListener('abort', cleanup, { once: true });
    },
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
