import { NextResponse } from "next/server";
import { getRuntimeConfig } from "@/lib/runtime-config.server";
import { isSupabaseEnabled } from "@/lib/runtime-config";

export async function GET() {
  const config = getRuntimeConfig();

  return NextResponse.json({
    status: "ok",
    service: config.appName,
    authEnabled: isSupabaseEnabled(config),
    authRequired: config.requireAuth,
    gtmEnabled: Boolean(config.gtmId),
  });
}
