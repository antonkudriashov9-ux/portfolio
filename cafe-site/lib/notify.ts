import "server-only";

/** Telegram-уведомления менеджеру. Молчит, если токен не настроен. */
export async function tgNotify(text: string): Promise<void> {
  try {
    const settings = await (await import("@/lib/db")).db.settings.findUnique({
      where: { id: "global" },
    });
    if (!settings?.tgBotToken || !settings?.tgChatId) return;

    await fetch(`https://api.telegram.org/bot${settings.tgBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: settings.tgChatId, text, parse_mode: "HTML" }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // уведомление не критично
  }
}
