import { checkCredentials, setSessionCookie, signSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { user?: string; password?: string } | null;
  const user = body?.user?.trim() || "";
  const password = body?.password || "";
  if (!checkCredentials(user, password)) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
  }
  await setSessionCookie(signSession(user));
  return NextResponse.json({ ok: true });
}
