import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("location");
  const date = searchParams.get("date") ?? "";

  if (!slug || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ ok: false, error: "Нужны location и date" }, { status: 400 });
  }

  const location = await db.location.findUnique({ where: { slug } });
  if (!location) {
    return NextResponse.json({ ok: false, error: "Точка не найдена" }, { status: 404 });
  }

  const bookings = await db.booking.findMany({
    where: { locationId: location.id, date, status: { not: "CANCELLED" } },
    select: { time: true, guestsCount: true },
  });

  const booked = new Map<string, number>();
  for (const b of bookings) {
    booked.set(b.time, (booked.get(b.time) ?? 0) + b.guestsCount);
  }

  const now = new Date();
  const isToday = date === now.toISOString().slice(0, 10);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots: { time: string; left: number }[] = [];
  for (let h = location.openHour; h < location.closeHour; h++) {
    for (let m = 0; m < 60; m += location.slotInterval) {
      const minutes = h * 60 + m;
      if (isToday && minutes <= nowMinutes + 30) continue;
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const used = booked.get(time) ?? 0;
      slots.push({ time, left: Math.max(0, location.slotCapacity - used) });
    }
  }

  return NextResponse.json({ ok: true, slots });
}
