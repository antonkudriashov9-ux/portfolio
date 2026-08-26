# ПРОМТ: Портфолио Full Stack Developer — «Живая топология»

> Вставь этот документ целиком ИИ-агенту (Cursor / Claude Code / opencode) в корне пустой папки.
> Рядом с промтом должен лежать файл `heroes.txt` — он понадобится на шаге 1.

---

## 1. Роль и цель

Ты — senior frontend-инженер и дизайнер интерфейсов. Собери production-ready сайт-портфолио full stack разработчика. Сайт должен выглядеть как авторская работа, а не шаблон: тёмный технологичный стиль, живая физика на canvas, продуманная типографика, много интерактива — но без визуального шума. Весь пользовательский контент — **на русском языке**.

**Сигнатурный момент №1:** хиро-экран с интерактивной пружинной решёткой (`KineticMatrix`) на фоне — узлы разлетаются от курсора, клик порождает ударную волну.

**Сигнатурный момент №2:** режим живого демо проектов — каждый мой сайт открывается во встроенном «браузере» с переключателем устройств прямо на портфолио.

---

## 2. Стек (использовать строго)

| Слой | Технология |
|---|---|
| Фреймворк | Next.js 15+ (App Router, RSC, Turbopack) |
| Язык | TypeScript, strict mode |
| Стили | Tailwind CSS v4 (токены через `@theme` в `globals.css`) |
| Компоненты | shadcn/ui (+ `cmdk`, `sonner` из его экосистемы) |
| Анимация | `motion` (Framer Motion) для reveal/micro, GSAP + ScrollTrigger для скролл-эффектов |
| Smooth scroll | `lenis` |
| Темы | `next-themes` (class strategy, dark по умолчанию) |
| Иконки | `lucide-react` (никаких emoji-иконок) |
| Формы | react-hook-form + zod + @hookform/resolvers |
| Шрифты | `next/font/google`: **Unbounded** (display), **Golos Text** (body), **JetBrains Mono** (mono) — все три поддерживают кириллицу |

---

## 3. Дизайн-система

### 3.1 Палитра (тёмная тема — по умолчанию)

```css
/* globals.css — Tailwind v4 */
@import "tailwindcss";

@theme {
  --color-background: #06080d;        /* глубокий холодный графит */
  --color-foreground: #e9eef5;
  --color-card: #0d1320;
  --color-muted: #141b29;
  --color-muted-foreground: #8c97ab;
  --color-border: rgba(233, 238, 245, 0.08);
  --color-accent: #ffb03a;            /* янтарный сигнальный */
  --color-accent-hover: #ffc46b;
  --color-on-accent: #1a1206;
  --color-steel: #6cb4ee;             /* вторичный холодный акцент */

  --font-display: var(--font-unbounded), sans-serif;
  --font-sans: var(--font-golos), sans-serif;
  --font-mono: var(--font-jetbrains), monospace;

  --radius-card: 16px;
}
```

Светлая тема (для next-themes): фон `#f4f6fa`, текст `#10151f`, акцент затемнить до `#b26a00` (контраст 4.5:1), сталь `#2b6cb0`. Компонент `KineticMatrix` уже умеет переключаться по классу `.dark` на `<html>` — ничего в нём менять не нужно.

**Почему янтарь, а не зелёный «матрикс»:** янтарные ЭЛТ-терминалы (DEC VT220) — редкая, узнаваемая отсылка; связка «ледяной графит + янтарь» читается как техно-ностальгия, а не шаблон «чёрный фон + acid green». Акцент используем точечно: статус-точки, активные состояния, ключевые цифры, фокус-ринги, выделения в тексте. Никаких залитых акцентом плашек.

### 3.2 Типографика

- Display: Unbounded 500–800. Только заголовки секций и имя в хиро. Размеры через `clamp()`: h1 `clamp(2.75rem, 9vw, 8rem)`, h2 `clamp(2rem, 5vw, 3.75rem)`.
- Body: Golos Text 400/500, 16–18px, line-height 1.6.
- Utility/labels/HUD: JetBrains Mono 400, 11–13px, uppercase, letter-spacing 0.08em — все «служебные» подписи сайта в моно-стиле (`// обо мне`, `[01] проекты`).

### 3.3 Принципы

- Один смелый элемент на экран, всё остальное — дисциплина и воздух.
- Структурные метки несут смысл: нумерация `[01]–[05]` только потому, что секции реально образуют порядок повествования.
- Никаких фиолетово-синих градиентов «AI-стартапа», никакого glassmorphism везде подряд, никакого дефолтного Inter/Roboto и синего `#3B82F6`.

---

## 4. Шаг 1 — компонент фона из `heroes.txt`

1. Прочитай файл `heroes.txt` в корне проекта. Внутри — готовый React-компонент `kinetic-matrix.tsx`.
2. Создай `components/ui/kinetic-matrix.tsx` с этим кодом дословно.
3. Установи его зависимость: `lucide-react`.
4. Подключай его **только** через `dynamic(() => import(...), { ssr: false })` — он использует canvas и window.
5. Использование в хиро: `<KineticMatrix title="{ИМЯ}" className="absolute inset-0 h-full w-full" />` как слой `z-0`; контент хиро — над ним `z-10 pointer-events-none` (кроме кнопок). Встроенные кнопки PULSE/FREEZE канваса оставить рабочими.
6. На мобильных допустимо уменьшить плотность решётки правкой константы `spacing` (52 → 64) — производительность важнее.

---

## 5. Структура проекта

```
app/
  layout.tsx            # шрифты, ThemeProvider, metadata, JSON-LD
  page.tsx              # одностраничник: секции
  globals.css           # токены @theme, база
  sitemap.ts / robots.ts
  api/contact/route.ts  # заглушка формы (или Formspree action)
  projects/[slug]/page.tsx          # страница проекта
  projects/[slug]/demo/page.tsx    # ЖИВОЕ ДЕМО (см. §8)
components/
  ui/                   # shadcn + kinetic-matrix.tsx
  layout/               # header, footer, preloader, custom-cursor
  sections/             # hero, marquee, about, projects, experience, contact
  fx/                   # magnetic-button, scramble-text, section-heading, reveal
  command-menu.tsx      # ⌘K палитра
  terminal.tsx          # пасхалка-терминал
lib/
  projects.ts           # данные проектов (модель в §9)
  utils.ts              # cn() из shadcn
providers.tsx           # ThemeProvider + LenisProvider
```

---

## 6. Секции сайта (одностраничник, сверху вниз)

### 6.0 Header
Fixed, при скролле — backdrop-blur и фон `rgba(6,8,13,.7)`. Слева mono-лого `[ИМЯ].dev`. Центр/право: якорные ссылки `Проекты / Обо мне / Опыт / Контакты`, кнопка темы (Sun/Moon), кнопка `⌘K`. Мобильное: полноэкранное overlay-меню с крупной типографикой и stagger-анимацией.

### 6.1 Hero (100vh)
- Фон: KineticMatrix (§4).
- Eyebrow mono: `// full stack developer — [ГОРОД]`
- H1: имя — Unbounded 800, uppercase, scramble-эффект при появлении (§7).
- Подзаголовок одной строкой: чем занимаюсь и какой ценности результат.
- Статус-бейдж: янтарная пульсирующая точка + «открыт к предложениям».
- CTA: магнитные кнопки «Смотреть проекты ↓» (accent) и «Связаться» (outline).
- HUD по углам (mono, 11px, muted): верх-лево — live-координаты курсора `X:0421 Y:0197`; верх-право — локальное время, тикает каждую секунду; низ-лево — «scroll ↓»; низ-право — `v2.0 // ©[ГОД]`. На мобильных HUD скрыть кроме времени.
- Всё содержимое, кроме кнопок и HUD, — `pointer-events-none`, чтобы физика канваса жила под текстом.

### 6.2 Marquee-лента стека
Бесшовная бегущая строка (CSS keyframes, два дублирующихся трека): `TypeScript · Node.js · React · PostgreSQL · Docker …` в mono с разделителями `//`. Пауза при hover, уважает prefers-reduced-motion.

### 6.3 Обо мне — bento grid
Асимметричная сетка (не ровные колонки!): крупная ячейка-био (2–3 абзаца живого текста про подход к разработке), ячейка «Стек» с группами Frontend/Backend/DevOps и тегами, ячейка GitHub-статистики (плейсхолдер или api.github.com на клиенте), ячейка «Локальное время» (тикает), ячейка-цитата/принцип работы. Reveal ячеек — stagger снизу.

### 6.4 Проекты — главная витрина
Заголовок `[02] Проекты` + счётчик `(06)` в mono. Раскладка: первая карточка featured — широкая (col-span-2), остальные обычные; на мобильных — одна колонка.
Карточка: скриншот (`next/image`, aspect 16/10, object-cover, hover — scale 1.04 и подъём оверлея), название (Unbounded), год mono, строка тегов стека, одно предложение сути, две кнопки: **«Живое демо»** (ведёт в §8) и «Код» (GitHub, иконка). Hover-курсор превращается в подпись «ОТКРЫТЬ».

### 6.5 Опыт
Вертикальный таймлайн: линия слева, mono-даты `[2023 — н.в.]`, роль, компания, 2–3 буллета достижений (конкретика, не обязанности). Reveal по мере скролла.

### 6.6 Контакты
Гигантский email в Unbounded (`clamp(1.5rem, 6vw, 4.5rem)`): клик копирует в буфер + toast «Почта скопирована». Рядом соцссылки GitHub/Telegram/LinkedIn (lucide, magnetic). Ниже мини-форма (имя, email, сообщение) с zod-валидацией и inline-состояниями loading/success/error.

### 6.7 Footer
Mono, muted: `© [ГОД] [ИМЯ] · собрано на Next.js + React 19`, кнопка «Наверх ↑» через lenis.

---

## 7. Интерактив и фишки (реализовать всё)

1. **Preloader:** оверлей с mono-логом загрузки и процентом; выход через clip-path вверх. Показывать один раз за сессию (sessionStorage); полностью пропускать при `prefers-reduced-motion`.
2. **Custom cursor:** точка + запаздывающее кольцо (lerp); растёт над ссылками/кнопками; над карточками проектов показывает подпись «ОТКРЫТЬ». Отключён на touch (`matchMedia('(hover: none)')`). Для форм оставить системный курсор (a11y fallback).
3. **Magnetic buttons:** притяжение к курсору в радиусе ~80px, пружинный возврат (motion spring).
4. **Scramble-text:** заголовки декодируются случайными символами (`01▓▒░/#`) за ~600мс при появлении во вьюпорте.
5. **Lenis smooth scroll**, якоря меню — через `lenis.scrollTo('#id')`.
6. **Scroll-reveal:** `motion` `whileInView` (fade + y 24px, stagger); GSAP ScrollTrigger — параллакс декоративных mono-подписей и медленный сдвиг скриншотов.
7. **Command palette ⌘K** (shadcn Command/cmdk): поиск по разделам и проектам + действия: сменить тему, скопировать email, «Скачать CV» (плейсхолдер `/cv.pdf`), «Импульс» — триггерит ударную волну канваса (ref/контекст).
8. **Темы:** dark/light/system, без FOUC; канвас перекрашивается сам.
9. **Терминал-пасхалка:** кнопка `_` в футере открывает модал-терминал: команды `help, whoami, stack, projects, contact, clear, sudo hire-me` (последняя отвечает шуткой и скроллит к контактам). История команд стрелками.
10. **Toasts** через sonner (копирование, форма).
11. Микро: hover-underline со шторкой у ссылок, tilt 3–5° на карточках проектов, плавный счётчик лет опыта в «Обо мне».

Все эффекты обязаны отключаться при `prefers-reduced-motion: reduce`.

---

## 8. Живое демо проектов (ключевая фича)

Маршрут `app/projects/[slug]/demo/page.tsx`. Полноэкранный «браузер в браузере»:

**Верхняя панель (h-14, фон card, бордер снизу):**
- Слева: три точки-«светофора» (decorative), кнопка «Назад к проекту» (ArrowLeft), кнопка перезагрузки (RotateCw).
- Центр: readonly адресная строка в mono с иконкой Lock: `project-live-url`.
- Справа: переключатель устройств — segmented control `Desktop | Tablet | Mobile` (Monitor/Tablet/Smartphone) и кнопка «Открыть в новой вкладке» (ExternalLink).

**Viewport:** iframe по центру, высота `calc(100vh - 56px)`, ширина пружинно (spring) переключается: Desktop = 100%, Tablet = 768px, Mobile = 390px; на меньших экранах масштабировать через `transform: scale()`.

**Технические требования:**
- `<iframe sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals">`, `loading="lazy"`, referrerPolicy="no-referrer".
- Монтировать iframe только на этой странице, лениво.
- Спиннер поверх до события `onLoad`; после — fade-out.
- Если за 8 секунд onLoad не случился (или фрейм заблокирован X-Frame-Options/CSP) — панель: «Автор сайта запретил встраивание» + кнопки «Открыть в новой вкладке» и «Назад». Таймеры чистить корректно.
- Страница доступна из карточек; title = «{Проект} — живое демо».

Страница проекта `app/projects/[slug]/page.tsx`: обложка, описание, задачи, стек-теги, highlights списком, большие кнопки «Живое демо» и «Исходный код», блок «Следующий проект».

---

## 9. Модель данных проектов

`lib/projects.ts`:

```ts
export type Project = {
  slug: string;
  title: string;
  tagline: string;        // одно предложение
  description: string;    // абзац-два
  highlights: string[];   // 3-4 достижения
  stack: string[];
  year: number;
  liveUrl: string;        // URL живого сайта -> идёт в iframe демо
  repoUrl?: string;
  screenshot: string;     // /images/projects/<slug>.webp
  featured?: boolean;
};

export const projects: Project[] = [ /* 3 записи-заглушки */ ];
```

Заполни тремя правдоподобными русскоязычными заглушками (интернет-магазин, SaaS-панель, телеграм-бот с админкой) с `liveUrl: "https://example.com"` — владелец заменит на свои. Скриншоты-заглушки — SVG/WebP-плейсхолдеры в `public/images/projects/` в стиле дизайн-системы (тонкая сетка + mono-подпись названия).

---

## 10. Нефункциональные требования

**Производительность:** канвас — dynamic import без SSR; шрифты next/font c `display: swap`; изображения AVIF/WebP + `sizes`; ниже первого экрана — lazy; Lighthouse performance/a11y/best-practices/SEO ≥ 95 (desktop).

**SEO:** Metadata API (ru): title-template `%s — [ИМЯ] · Full Stack Developer`, description, OpenGraph + Twitter card, `sitemap.ts`, `robots.ts`, JSON-LD `Person` (name, jobTitle, url, sameAs), favicon set.

**Доступность:** семантические landmarks, видимый `focus-visible` ринг янтарём, aria-label на всех иконочных кнопках, контраст ≥ 4.5:1, `prefers-reduced-motion` глушит Lenis/preloader/scramble/канвас (один статичный кадр), alt-тексты.

**Адаптив:** проверить 375 / 768 / 1024 / 1440. На мобильных: без кастомного курсора, HUD упрощён, bento в одну колонку, канвас реже (§4.6), нет горизонтального скролла.

**Качество кода:** TypeScript strict без `any`, ESLint чистый, `'use client'` только где нужно, компоненты ≤ ~200 строк.

---

## 11. Порядок работы

1. Прочитать `heroes.txt` → создать `components/ui/kinetic-matrix.tsx` (§4).
2. `npx create-next-app@latest .` (TS, App Router, Tailwind v4, alias `@/*`) → `npx shadcn@latest init`.
3. Установить: `motion gsap lenis next-themes lucide-react react-hook-form zod @hookform/resolvers sonner cmdk` + shadcn-компоненты `button dialog command sonner tooltip badge input textarea label`.
4. `globals.css` токены (§3.1) + шрифты в `layout.tsx` + `providers.tsx` (тема + Lenis).
5. FX-примитивы: `custom-cursor`, `magnetic-button`, `scramble-text`, `reveal`, `section-heading`, `preloader`.
6. Секции по §6 сверху вниз, данные из `lib/projects.ts`.
7. Страницы проекта и демо (§8).
8. Command palette, терминал, toasts.
9. SEO/a11y/perf полировка (§10).
10. `npm run build` и `npm run lint` — ноль ошибок; чеклист §12.
11. Отчёт: структура файлов + список плейсхолдеров для замены владельцем.

---

## 12. Чеклист приёмки

- [ ] `heroes.txt` использован как фон хиро; физика работает: отталкивание курсором, ударная волна по клику, PULSE/FREEZE живые
- [ ] Демо-режим: iframe, 3 viewport-режима, адресная строка, fallback при запрете встраивания
- [ ] ⌘K палитра находит разделы и проекты, действия работают
- [ ] Терминал отвечает на все команды из §7.9
- [ ] Тема dark↔light переключается, канвас и токены перекрашиваются
- [ ] Кастомный курсор, магнитные кнопки, scramble, marquee есть и отключаются при reduced-motion
- [ ] Email копируется с toast; форма валидируется и показывает состояния
- [ ] Полностью русский контент, ни одного lorem ipsum
- [ ] Нет emoji-иконок, alert(), фиолетовых градиентов, Inter
- [ ] `npm run build` и `npm run lint` проходят без ошибок и предупреждений
- [ ] Lighthouse ≥ 95 по всем четырём категориям (desktop)
- [ ] Адаптив проверен на 375px без горизонтального скролла

---

## 13. Плейсхолдеры для замены владельцем

`[ИМЯ]`, `[ГОРОД]`, `[ГОД]`, `[EMAIL]`, ссылки GitHub/Telegram/LinkedIn, `/cv.pdf`, URL и скриншоты трёх проектов в `lib/projects.ts`.

Начинай. Если какое-то требование конфликтует с возможностями стека — выбери более современное решение и отметь это в отчёте.
