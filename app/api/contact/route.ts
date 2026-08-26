import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.email(),
  message: z.string().min(10),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Некорректные данные формы" },
      { status: 400 }
    );
  }

  // ⚠️ Заглушка отправки: подключи сюда Resend/Formspree/SMTP
  await new Promise((r) => setTimeout(r, 400));

  return NextResponse.json({ ok: true });
}
