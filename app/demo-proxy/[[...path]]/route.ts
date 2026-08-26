/**
 * Локальный реверс-прокси для живого демо в iframe.
 * Сайт proavtoimport.ru отдаёт CSP `frame-ancestors 'none'`,
 * поэтому встраивание напрямую невозможно. Прокси забирает страницу
 * сервер-сайд, срезает заголовки фрейминга и переписывает ссылки,
 * чтобы навигация оставалась внутри демо-браузера.
 *
 * ⚠️ Продакшн proavtoimport.ru не затрагивается вообще.
 */

const UPSTREAM = "https://proavtoimport.ru";
const PROXY_PREFIX = "/demo-proxy";
const TIMEOUT_MS = 15_000;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Снапшот-режим: вырезаем ВСЕ скрипты встроенной SPA.
 * Причина: proavtoimport.ru сам является Next.js App Router — после гидрации
 * его клиентский роутер видит путь /demo-proxy/, не находит маршрут
 * и затирает страницу 404-м состоянием; плюс ссылки на чанки лежат
 * внутри RSC-flight-данных и не переписываются. Без скриптов страница
 * детерминированно рендерится как документ: стили, шрифты, картинки,
 * CSS-анимации сохраняются.
 */
function stripScripts(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<script\b[^>]*\/>/gi, "")
    .replace(/<link\b[^>]*rel=["'](?:modulepreload|preload)["'][^>]*>/gi, (m) =>
      /as=["'](?:script|worker|serviceworker)["']/i.test(m) || /modulepreload/i.test(m)
        ? ""
        : m
    );
}

function rewriteBody(body: string, contentType: string): string {
  let out = body
    .replaceAll(`${UPSTREAM}/`, `${PROXY_PREFIX}/`)
    .replaceAll(UPSTREAM, PROXY_PREFIX)
    .replaceAll("//proavtoimport.ru", PROXY_PREFIX);

  // кавычкованные и голые формы css url() — в html и css/js
  out = out
    .replaceAll('url("/', `url("${PROXY_PREFIX}/`)
    .replaceAll("url('/", `url('${PROXY_PREFIX}/`)
    .replaceAll("url(/", `url(${PROXY_PREFIX}/`);

  if (contentType.includes("text/html")) {
    out = out
      .replaceAll('href="/', `href="${PROXY_PREFIX}/`)
      .replaceAll('src="/', `src="${PROXY_PREFIX}/`)
      .replaceAll('srcset="/', `srcset="${PROXY_PREFIX}/`)
      .replaceAll('action="/', `action="${PROXY_PREFIX}/`);
    out = stripScripts(out);
  }

  return out;
}

const MEDIA_EXT = /\.(mp4|webm|ogv|mov|m4v|mp3|wav|ogg)$/i;

async function proxy(req: Request, segments?: string[]): Promise<Response> {
  const url = new URL(req.url);
  const target = `${UPSTREAM}/${(segments ?? []).join("/")}${url.search}`;

  const headers = new Headers();
  for (const name of ["accept", "accept-language", "content-type", "user-agent"]) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  const range = req.headers.get("range");
  if (range) headers.set("range", range);

  let body: ArrayBuffer | undefined;
  if (req.method === "POST") {
    body = await req.arrayBuffer();
  }

  // медиа отдаём потоком с поддержкой Range и без короткого таймаута
  const isMedia =
    Boolean(range) || MEDIA_EXT.test(new URL(target).pathname);

  try {
    const res = await fetch(target, {
      method: req.method,
      headers,
      body,
      redirect: "follow",
      cache: "no-store",
      signal: isMedia ? AbortSignal.timeout(120_000) : AbortSignal.timeout(TIMEOUT_MS),
    });

    const contentType = res.headers.get("content-type") ?? "";
    const outHeaders = new Headers();
    if (contentType) outHeaders.set("content-type", contentType);
    outHeaders.set(
      "cache-control",
      contentType.includes("text/html") ? "no-store" : "public, max-age=3600"
    );
    outHeaders.set("x-proxied-host", "proavtoimport.ru");
    for (const name of ["content-length", "content-range", "accept-ranges"]) {
      const value = res.headers.get(name);
      if (value) outHeaders.set(name, value);
    }

    if (res.body && /text\/html|text\/css|javascript|ecmascript/.test(contentType)) {
      const rewritten = rewriteBody(await res.text(), contentType);
      return new Response(rewritten, { status: res.status, headers: outHeaders });
    }

    return new Response(res.body, { status: res.status, headers: outHeaders });
  } catch (error) {
    return new Response(
      `<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:monospace;background:#0b101a;color:#8c97ab;display:grid;place-items:center;height:100vh"><p>прокси недоступен: ${String(error).slice(0, 120)}</p></body></html>`,
      { status: 502, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ path?: string[] }> }
): Promise<Response> {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export const POST = GET;
