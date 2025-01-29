import { caller } from "@/trpc/routers/app";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const events = await caller.events(undefined);

  const readable = new ReadableStream<string>({
    async start(controller) {
      for await (const event of events) {
        if (!event) break;

        controller.enqueue("data: update\n\n");
      }
      console.log("closing");
      controller.close();
    },
    // signal: request.signal,
  });

  return new Response(
    readable.pipeThrough(new TextEncoderStream(), { signal: request.signal }),
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
