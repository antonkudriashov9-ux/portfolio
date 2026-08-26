import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { tgNotify } from "@/lib/notify";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  eventType: z.string().min(2),
  guestsCount: z.number().int().min(1).max(500).nullable().optional(),
  date: z.string().nullable().optional(),
  comment: z.string().max(1000).nullable().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Проверьте поля формы" }, { status: 400 });
  }

  const request = await db.eventRequest.create({ data: parsed.data });

  await tgNotify(
    `🎉 Заявка на ${request.eventType}\n${request.name}, ${request.phone}` +
      (request.guestsCount ? `\nГостей: ${request.guestsCount}` : "") +
      (request.date ? `\nДата: ${request.date}` : "") +
      (request.comment ? `\n${request.comment}` : "")
  );

  return NextResponse.json({ ok: true });
}
