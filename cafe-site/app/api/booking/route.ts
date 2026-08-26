import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { tgNotify } from "@/lib/notify";

const schema = z.object({
  locationSlug: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  guestsCount: z.number().int().min(1).max(20),
  name: z.string().min(2),
  phone: z.string().min(6),
  comment: z.string().max(500).nullable().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Проверьте данные брони" }, { status: 400 });
  }
  const data = parsed.data;

  const location = await db.location.findUnique({ where: { slug: data.locationSlug } });
  if (!location) {
    return NextResponse.json({ ok: false, error: "Точка не найдена" }, { status: 404 });
  }

  // повторная проверка вместимости слота
  const sameSlot = await db.booking.findMany({
    where: {
      locationId: location.id,
      date: data.date,
      time: data.time,
      status: { not: "CANCELLED" },
    },
    select: { guestsCount: true },
  });
  const used = sameSlot.reduce((sum, b) => sum + b.guestsCount, 0);
  if (used + data.guestsCount > location.slotCapacity) {
    return NextResponse.json(
      { ok: false, error: "На это время мест уже нет — выберите другое" },
      { status: 409 }
    );
  }

  // гость: по телефону
  const phoneDigits = data.phone.replace(/[^\d+]/g, "");
  const guest = await db.guest.upsert({
    where: { phone: phoneDigits },
    update: { name: data.name },
    create: { phone: phoneDigits, name: data.name },
  });

  const booking = await db.booking.create({
    data: {
      locationId: location.id,
      guestId: guest.id,
      guestName: data.name,
      guestPhone: phoneDigits,
      guestsCount: data.guestsCount,
      date: data.date,
      time: data.time,
      comment: data.comment ?? null,
      status: "NEW",
      source: "SITE",
    },
  });

  await db.auditLog.create({
    data: {
      userEmail: "guest@site",
      action: "BOOKING_CREATE",
      detail: `${data.name} · ${location.name} · ${data.date} ${data.time}`,
    },
  });

  await tgNotify(
    `🪑 Новая бронь\n${data.name}, ${data.phone}\n${location.name} · ${data.date} в ${data.time}\nГостей: ${data.guestsCount}` +
      (data.comment ? `\n${data.comment}` : "")
  );

  return NextResponse.json({
    ok: true,
    booking: {
      id: booking.id,
      location: location.name,
      date: data.date,
      time: data.time,
      guestsCount: data.guestsCount,
    },
  });
}
