import { getEventsStream } from "@/lib/docker";
import { setTimeout } from "node:timers/promises";
import { baseProcedure } from "../init";

export const eventsRouter = baseProcedure.subscription(async function* (opts) {
  const stream = await getEventsStream(opts.signal);
  const reader = stream.getReader();

  let promise: Promise<ReadableStreamReadResult<Uint8Array>> | null = null;
  let result: ReadableStreamReadResult<Uint8Array> | null;
  let hadNewEvents = false;

  try {
    while (!opts.signal?.aborted) {
      // Read the next event (or the previous event if it's still pending).
      promise = promise ?? reader.read();
      result = await promise;
      promise = null;
      if (result.done) break;

      // Emit the event signal to the client.
      yield true;

      // Wait for 500ms before yielding again.
      await setTimeout(500);

      // Drain all pending events for 500ms.
      while (!opts.signal?.aborted) {
        promise = reader.read();
        result = await Promise.race([
          promise,
          setTimeout(500).then(() => null),
        ]);

        // If the timer expired, break out of draining.
        if (result === null) break;

        // Otherwise record that we had new event or that we're done.
        promise = null;
        if (result.done) return;
        hadNewEvents = true;
      }

      // If we had new events, emit the event signal to the client.
      if (hadNewEvents) yield true;
    }
  } catch (error) {
    if (error instanceof Error && error.name === "ResponseAborted") {
      return;
    }
    throw error;
  } finally {
    await reader.cancel();
  }
});
