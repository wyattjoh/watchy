import { createCallerFactory, createTRPCRouter } from "../init";
import { widgetsRouter } from "./widgets/widgets";
import { eventsRouter } from "./events";
import { servicesRouter } from "./services";

export const appRouter = createTRPCRouter({
  services: servicesRouter,
  events: eventsRouter,
  widgets: widgetsRouter,
});

export type AppRouter = typeof appRouter;

export const caller = createCallerFactory(appRouter)({});
