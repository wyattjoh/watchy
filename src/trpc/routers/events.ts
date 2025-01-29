import { getEvents } from "@/lib/docker";
import { baseProcedure } from "../init";

export const eventsRouter = baseProcedure.subscription(async function* (opts) {
  const stream = await getEvents(opts.signal);
  const reader = stream.getReader();

  try {
    while (!opts.signal?.aborted) {
      const { done } = await reader.read();
      if (done) {
        break;
      }

      yield true;
    }
  } catch (error) {
    if (error instanceof Error && error.name === "ResponseAborted") {
      return;
    }

    throw error;
  } finally {
    reader.releaseLock();
  }
});
