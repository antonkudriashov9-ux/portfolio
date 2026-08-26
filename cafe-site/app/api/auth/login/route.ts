import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Заполните поля" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ ok: false, error: "Неверная почта или пароль" }, { status: 401 });
  }

  const token = await createSessionToken({ email: user.email, name: user.name, role: user.role });

  await db.auditLog.create({
    data: { userEmail: user.email, action: "LOGIN", detail: "Вход в админку" },
  });

  const isHttps =
    new URL(req.url).protocol === "https:" ||
    req.headers.get("x-forwarded-proto") === "https";

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
