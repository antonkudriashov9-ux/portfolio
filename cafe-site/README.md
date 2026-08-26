# Не только макароны — сайт + CRM

Сайт ресторана «Не только макароны» (Non Solo Pasta), Липецк: кинематографичный моушн,
параллакс, живое меню из БД, онлайн-бронирование слотами и CRM-админка.

## Стек

- Next.js 16 (App Router) · React 19 · TypeScript strict
- Tailwind CSS v4 · shadcn/ui · motion · GSAP ScrollTrigger · Lenis
- Prisma + PostgreSQL · Auth (jose + bcrypt) · Telegram-уведомления

## Структура

```
app/(site)/        публичные страницы: главная, /menu, /gallery, /locations, /events, /booking
app/admin/         CRM: дашборд, бронирования, гости, меню, медиатека, банкеты, отзывы, настройки
app/api/           availability · booking · events · auth
prisma/            схема + сиды (реальное меню, точки, медиа)
components/        fx (параллакс, reveal, magnetic, counter), секции, админ-компоненты
public/media/      115 фотографий (Яндекс.Карты)
```

## Локальный запуск

```bash
npm install
# .env: DATABASE_URL=postgresql://... ; AUTH_SECRET=...
npx prisma db push
npx prisma db seed && npx tsx prisma/seed-media.ts
npm run build && npm start
```

Админка: `/login` → `admin@ntm.ru` / `admin123` (сменить на проде).

## Деплой на Vercel

1. Создай Postgres (Neon — бесплатный тариф) и скопируй connection string.
2. Vercel → New Project → импортируй этот репозиторий.
3. Environment Variables:
   - `DATABASE_URL` = строка Neon (с `?sslmode=require`)
   - `AUTH_SECRET` = длинная случайная строка
4. Deploy. После первого деплоя прогони один раз локально против прод-БД:
   `DATABASE_URL="<neon>" npx prisma db push && npx prisma db seed`
5. Домен и hero-видео — через CRM (`/admin/settings`, `/admin/media`).
