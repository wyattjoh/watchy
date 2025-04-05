import { baseProcedure, createTRPCRouter } from "../init";
import { listAllContainers, listServices } from "@/lib/docker";

export const containersRouter = createTRPCRouter({
  listServices: baseProcedure.query(async () => {
    return listServices();
  }),
  listAll: baseProcedure.query(async () => {
    return listAllContainers();
  }),
});
