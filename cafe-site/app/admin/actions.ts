"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireSession() {
  const store = await cookies();
  const session = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

/* ── Бронирования ─────────────────────────────────────────── */

export async function setBookingStatus(form: FormData) {
  await requireSession();
  const id = str(form, "id");
  const status = str(form, "status");
  if (!id || !["NEW", "CONFIRMED", "SEATED", "NOSHOW", "CANCELLED"].includes(status)) return;
  await db.booking.update({ where: { id }, data: { status } });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

/* ── Гости ────────────────────────────────────────────────── */

export async function updateGuest(form: FormData) {
  await requireSession();
  const id = str(form, "id");
  if (!id) return;
  const birthday = str(form, "birthday");
  await db.guest.update({
    where: { id },
    data: {
      name: str(form, "name") || null,
      birthday: birthday ? new Date(birthday) : null,
      tags: str(form, "tags") || null,
      notes: str(form, "notes") || null,
    },
  });
  revalidatePath("/admin/guests");
}

/* ── Меню ─────────────────────────────────────────────────── */

export async function toggleDishAvailable(form: FormData) {
  await requireSession();
  const id = str(form, "id");
  const available = str(form, "available") === "true";
  if (!id) return;
  await db.dish.update({ where: { id }, data: { available } });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
}

export async function setDishPrice(form: FormData) {
  await requireSession();
  const id = str(form, "id");
  const price = Number(str(form, "price"));
  if (!id || !Number.isFinite(price) || price < 0) return;
  await db.dish.update({ where: { id }, data: { price: Math.round(price) } });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
}

export async function setHitOfWeek(form: FormData) {
  await requireSession();
  const id = str(form, "id");
  if (!id) return;
  await db.dish.updateMany({ data: { isHitOfWeek: false } });
  await db.dish.update({ where: { id }, data: { isHitOfWeek: true } });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
}

export async function addDish(form: FormData) {
  await requireSession();
  const categoryId = str(form, "categoryId");
  const title = str(form, "title");
  const price = Number(str(form, "price"));
  if (!categoryId || !title || !Number.isFinite(price)) return;
  const last = await db.dish.findFirst({
    where: { categoryId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  await db.dish.create({
    data: {
      categoryId,
      title,
      price: Math.round(price),
      weight: str(form, "weight") || null,
      description: str(form, "description") || null,
      tags: str(form, "tags") || null,
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
}

export async function deleteDish(form: FormData) {
  await requireSession();
  const id = str(form, "id");
  if (!id) return;
  await db.dish.delete({ where: { id } });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
}

/* ── Банкеты ──────────────────────────────────────────────── */

export async function setEventStatus(form: FormData) {
  await requireSession();
  const id = str(form, "id");
  const status = str(form, "status");
  if (!id || !["NEW", "IN_PROGRESS", "DONE", "DECLINED"].includes(status)) return;
  await db.eventRequest.update({ where: { id }, data: { status } });
  revalidatePath("/admin/events");
}

/* ── Отзывы ───────────────────────────────────────────────── */

export async function addReview(form: FormData) {
  await requireSession();
  const author = str(form, "author");
  const text = str(form, "text");
  const rating = Number(str(form, "rating"));
  if (!author || !text || !Number.isFinite(rating)) return;
  await db.review.create({
    data: {
      author,
      text,
      rating: Math.min(5, Math.max(1, Math.round(rating))),
      source: str(form, "source") || "YANDEX",
      sentiment: rating >= 4 ? "POS" : rating <= 2 ? "NEG" : "NEUT",
    },
  });
  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
}

export async function toggleReviewAnswered(form: FormData) {
  await requireSession();
  const id = str(form, "id");
  const answered = str(form, "answered") === "true";
  if (!id) return;
  await db.review.update({ where: { id }, data: { answered } });
  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
}

/* ── Медиа ────────────────────────────────────────────────── */

export async function uploadMedia(form: FormData) {
  await requireSession();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  if (file.size > 50 * 1024 * 1024) return;

  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
  const kind = ["mp4", "webm", "mov"].includes(ext) ? "video" : "photo";
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  const name = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  await db.mediaItem.create({
    data: { url: `/uploads/${name}`, kind, title: str(form, "title") || file.name, inGallery: kind === "photo" },
  });
  revalidatePath("/admin/media");
  revalidatePath("/gallery");
}

export async function toggleInGallery(form: FormData) {
  await requireSession();
  const id = str(form, "id");
  const inGallery = str(form, "inGallery") === "true";
  if (!id) return;
  await db.mediaItem.update({ where: { id }, data: { inGallery } });
  revalidatePath("/admin/media");
  revalidatePath("/gallery");
}

/* ── Настройки ────────────────────────────────────────────── */

export async function saveSettings(form: FormData) {
  await requireSession();
  await db.settings.upsert({
    where: { id: "global" },
    update: {
      heroVideoUrl: str(form, "heroVideoUrl") || null,
      tgBotToken: str(form, "tgBotToken") || null,
      tgChatId: str(form, "tgChatId") || null,
      bookingNotice: str(form, "bookingNotice") || null,
    },
    create: {
      id: "global",
      heroVideoUrl: str(form, "heroVideoUrl") || null,
      tgBotToken: str(form, "tgBotToken") || null,
      tgChatId: str(form, "tgChatId") || null,
      bookingNotice: str(form, "bookingNotice") || null,
    },
  });
  revalidatePath("/admin/settings");
  revalidatePath("/");
}
