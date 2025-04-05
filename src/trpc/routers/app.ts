import { createCallerFactory, createTRPCRouter } from "../init";
import { widgetsRouter } from "./widgets/widgets";
import { eventsRouter } from "./events";
import { containersRouter } from "./containers";

export const appRouter = createTRPCRouter({
  containers: containersRouter,
  events: eventsRouter,
  widgets: widgetsRouter,
});

export type AppRouter = typeof appRouter;

export const caller = createCallerFactory(appRouter)({});
