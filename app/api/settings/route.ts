import { getSession } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/store";
import { parseSettings } from "@/lib/validate";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(await getSettings());
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const parsed = parseSettings(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  await saveSettings(parsed.settings);
  return NextResponse.json(parsed.settings);
}
