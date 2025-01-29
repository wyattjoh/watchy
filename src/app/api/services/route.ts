import { caller } from "@/trpc/routers/app";

export const dynamic = "force-dynamic";

export async function GET() {
  const services = await caller.services();
  return Response.json(services);
}
