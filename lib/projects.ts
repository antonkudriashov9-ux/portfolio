// ⚠️ ЗАГЛУШКИ — замени на свои проекты (liveUrl уходит в iframe демо)
export type Project = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  highlights: string[];
  stack: string[];
  year: number;
  liveUrl: string;
  repoUrl?: string;
  screenshot: string;
  featured?: boolean;
  /** локальный путь реверс-прокси для iframe, если live-сайт запрещает встраивание */
  embedUrl?: string;
};

export const projects: Project[] = [
  {
    slug: "ne-tolko-makarony",
    title: "Не только макароны",
    tagline: "Сайт и CRM ресторана: кинематографичный моушн, живое меню из базы и онлайн-бронирование столиков.",
    description:
      "Полный цифровой контур для сети из двух ресторанов в Липецке. Публичная часть — тёмный кинематографичный дизайн с параллаксом на GSAP ScrollTrigger, виджетом выбора формы пасты и стеной отзывов. Меню живёт в базе и управляется из CRM. Онлайн-бронь слотами с контролем вместимости складывает заявки прямо в админку, откуда менеджер ведёт гостей (дни рождения, теги, история) и банкеты.",
    highlights: [
      "CRM: брони, гости с днями рождения, меню с наличием, банкеты, отзывы",
      "Онлайн-бронь слотами с проверкой вместимости и Telegram-уведомлениями",
      "Моушн: многослойный параллакс, split-reveal типографика, магнитные кнопки",
      "115 реальных фотографий, слот под hero-видео из медиатеки",
    ],
    stack: ["Next.js 16", "React 19", "Prisma", "PostgreSQL", "GSAP", "Tailwind v4"],
    year: 2026,
    liveUrl: "https://wrote-fat-from-response.trycloudflare.com",
    repoUrl: "https://github.com/antonkudriashov9-ux/portfolio/tree/main/cafe-site",
    screenshot: "/images/projects/ne-tolko-makarony.svg",
  },
  {
    slug: "pro-avto-import",
    title: "Pro Авто Импорт",
    tagline: "Платформа импорта автомобилей из Японии, Кореи и Китая под ключ: каталог, подбор и личный кабинет клиента.",
    description:
      "Полноценный продукт для компании по импорту авто из Азии. Каталог с фильтрами по странам и аукционам (USS, Hyundai Glovis, K-Car), конструктор подбора автомобиля с фиксацией бюджета под ключ, личный кабинет клиента с документами, оплатами и статусом сделки онлайн. Отзывы интегрированы с Яндекс Картами, заявки уходят в Telegram и MAX.",
    highlights: [
      "Личный кабинет: документы, оплаты и статус сделки — всё онлайн",
      "Эскроу-платежи и фотоотчёты каждые 48 часов",
      "4 700+ оценок Яндекс Карт встроены в страницу отзывов",
      "Растаможка, СБКТС и ЭПТС оформляются в один контур",
    ],
    stack: ["Next.js", "TypeScript", "Telegram API", "Яндекс Карты"],
    year: 2026,
    liveUrl: "https://proavtoimport.ru/",
    screenshot: "/images/projects/pro-avto-import.svg",
    featured: true,
    embedUrl: "/demo-proxy/",
  },
  {
    slug: "shopstream",
    title: "ShopStream",
    tagline: "Интернет-магазин электроники с живыми ценами и корзиной в реальном времени.",
    description:
      "Полноценный e-commerce: витрина, фильтры по 20+ параметрам, корзина с синхронизацией между вкладками через WebSocket и оплата через платёжный шлюз. Админка с ролями, аналитикой продаж и управлением складом.",
    highlights: [
      "Первый байт — 120 мс благодаря ISR и edge-кэшу",
      "Lighthouse 98 на мобильных",
      "Конверсия корзины выросла на 18% после редизайна чекаута",
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "WebSocket", "Docker"],
    year: 2026,
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/username/shopstream",
    screenshot: "/images/projects/shopstream.svg",
  },
  {
    slug: "pulseboard",
    title: "PulseBoard",
    tagline: "SaaS-панель аналитики для маркетплейсов с прогнозом выручки.",
    description:
      "Дашборд, который собирает данные о продажах с четырёх маркетплейсов, считает юнит-экономику и строит прогноз выручки на месяц вперёд. Графики на своих рендер-компонентах, экспорт в Excel, командный доступ с ролями.",
    highlights: [
      "Прогноз с точностью ±7% по данным за 90 дней",
      "40k строк данных рендерятся без лагов (виртуализация)",
      "Подписки и биллинг через Stripe",
    ],
    stack: ["React", "Node.js", "ClickHouse", "Redis", "Stripe"],
    year: 2025,
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/username/pulseboard",
    screenshot: "/images/projects/pulseboard.svg",
  },
  {
    slug: "taskforge-bot",
    title: "TaskForge Bot",
    tagline: "Телеграм-бот управления задачами команды с админкой.",
    description:
      "Бот для небольших команд: постановка задач голосом, напоминания, отчёты по спринту. Веб-админка на том же API: доска задач, статистика по участникам, интеграция с Google Calendar.",
    highlights: [
      "Распознавание голосовых сообщений в задачи",
      "2 400+ активных пользователей",
      "Один деплой — бот и админка из одного репозитория",
    ],
    stack: ["Telegram Bot API", "NestJS", "MongoDB", "React", "Redis"],
    year: 2025,
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/username/taskforge-bot",
    screenshot: "/images/projects/taskforge-bot.svg",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getNextProject(slug: string): Project {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
}
