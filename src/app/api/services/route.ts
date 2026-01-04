import { connection } from "next/server";
import { caller } from "@/trpc/routers/app";

export async function GET() {
  await connection();
  const services = await caller.containers.listServices();
  return Response.json(services);
}
