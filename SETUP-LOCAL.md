# Локальная настройка на этой машине

Файл для агента и для себя: как проект поднят здесь и на что можно наступить.
В репозиторий не мешает — состояние окружения, а не код.

## Что где

| | |
|---|---|
| Рабочая копия | `/home/hermes/projects/portfolio` |
| Удалённый | `https://github.com/antonkudriashov9-ux/portfolio.git` (ветка `main`) |
| Портфолио | корень репозитория, Next.js 16.3.3 + React 19.2.8 + Tailwind 4 |
| Сайт кафе | `cafe-site/` — «Не только макароны», Липецк, + CRM |

## Доступ к GitHub

Токен лежит в `~/tools/github/credentials.env` (права 600, каталог 700).

**В `.git/config` и в адресе удалённого токена НЕТ** — он отдаётся помощником
`~/tools/github/git-credential-github.sh`, чтобы не утечь через `git remote -v`
или случайный коммит конфига:

```bash
git config credential."https://github.com".helper "$HOME/tools/github/git-credential-github.sh"
```

Проверка связи: `git ls-remote --heads origin` (должен вернуть хеш `main`).

Авторство задано **только для этого репозитория** (`git config user.*` без
`--global`), как в существующих коммитах:
`antonkudriashov9-ux <antonkudriashov9-ux@users.noreply.github.com>`.
Глобальные настройки (`Jarvis Agent`) не тронуты — другие проекты идут как были.

## База для cafe-site

Postgres на этой машине слушает **UNIX-сокет**, а не TCP-порт, поэтому строка
из `.env.example` (`localhost:5433`) не подходит. Рабочий вариант — сокет
через параметр `host`:

```
DATABASE_URL="postgresql://hermes@localhost:5433/ntm?host=%2Fhome%2Fhermes%2Ftools%2Fpgsock&schema=public"
```

Поднять с нуля:

```bash
source ~/tools/pg-env.sh          # PGHOST=/home/hermes/tools/pgsock PGPORT=5433
createdb ntm
cd cafe-site
npx prisma db push --skip-generate     # 13 таблиц
set -a; . ./.env; set +a               # ОБЯЗАТЕЛЬНО, см. грабли
npx tsx prisma/seed.ts                 # точки, админ, меню
npx tsx prisma/seed-media.ts           # 115 фото, 5 слайдов
npm run build
```

`.env` создан локально и в git не попадает (`.env*` в `.gitignore`),
`AUTH_SECRET` сгенерирован случайно.

## Грабли

- **`tsx` не читает `.env` сам**, в отличие от Prisma CLI. Сиды падали с
  `Environment variable not found: DATABASE_URL`, хотя `prisma db push` работал.
  Перед запуском сидов: `set -a; . ./.env; set +a`.
- **Сборка `cafe-site` требует живой базы.** Страницы читают данные при
  пререндере, поэтому без наполненной БД сборка падает на `/(site)/page`
  ошибкой Prisma — выглядит как ошибка кода, а причина в отсутствии данных.
- **`npm install` переписывает `name` в `package-lock.json`**
  (`portfolio-scaffold` → `portfolio`). Правка безобидная, но появляется в
  `git status`; если не нужна — `git checkout -- package-lock.json`.
- **`AGENTS.md` предупреждает**: этот Next.js отличается от привычного, API
  смотреть в `node_modules/next/dist/docs/`, а не по памяти.
- Блок `nextjs-agent-rules` в `AGENTS.md` дописывается самим `next dev` —
  удалять из diff бессмысленно, он вернётся.

## Проверено

- `npm run build` в корне — портфолио собирается, 5 проектов + sitemap
- `npm run build` в `cafe-site` — собирается, публичные страницы и CRM
- `git ls-remote origin` — доступ к GitHub работает, право `push` есть
- токена нет в `.git/config`; `.env` с правами 600 и в игноре
