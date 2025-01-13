import { getServices } from "@/lib/docker";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const services = await getServices();
  return NextResponse.json(services);
}
