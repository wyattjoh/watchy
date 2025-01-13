import { debounce } from "@/lib/debounce";
import { getEvents } from "@/lib/docker";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const stream = await getEvents(request.signal);

  let terminated = false;
  const sendUpdate = debounce(
    (controller: TransformStreamDefaultController<string>) => {
      if (request.signal.aborted || terminated) return;
      controller.enqueue("data: update\n\n");
    },
    500,
    1000
  );

  const transformer = new TransformStream<string, string>({
    transform(_, controller) {
      sendUpdate(controller);
    },
    flush() {
      terminated = true;
    },
  });

  return new Response(
    stream
      .pipeThrough(new TextDecoderStream(), { signal: request.signal })
      .pipeThrough(transformer, { signal: request.signal })
      .pipeThrough(new TextEncoderStream(), { signal: request.signal }),
    {
      headers: {
        // Set the headers for Server-Sent Events (SSE)
        Connection: "keep-alive",
        "Content-Encoding": "none",
        "Cache-Control": "no-cache, no-transform",
        "Content-Type": "text/event-stream; charset=utf-8",
      },
    }
  );
}
