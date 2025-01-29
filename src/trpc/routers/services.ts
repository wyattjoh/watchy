import { baseProcedure } from "../init";
import { getServices } from "@/lib/docker";

export const servicesRouter = baseProcedure.query(async () => {
  return getServices();
});
