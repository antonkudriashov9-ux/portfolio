import { db } from "@/lib/db";
import { saveSettings } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function AdminSettings() {
  const settings = await db.settings.findUnique({ where: { id: "global" } });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl">Настройки</h1>

      <form action={saveSettings}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Интеграции и герой</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label htmlFor="st-video">URL hero-видео (пусто = фотослайдер)</Label>
              <Input
                id="st-video"
                name="heroVideoUrl"
                defaultValue={settings?.heroVideoUrl ?? ""}
                placeholder="/uploads/hero.mp4"
              />
              <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                загрузите видео в Медиатеке и вставьте его путь сюда
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="st-tg-token">Telegram bot token</Label>
                <Input
                  id="st-tg-token"
                  name="tgBotToken"
                  defaultValue={settings?.tgBotToken ?? ""}
                  placeholder="123456:ABC-DEF…"
                  type="password"
                />
              </div>
              <div>
                <Label htmlFor="st-tg-chat">Telegram chat id</Label>
                <Input
                  id="st-tg-chat"
                  name="tgChatId"
                  defaultValue={settings?.tgChatId ?? ""}
                  placeholder="-1001234567890"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="st-notice">Текст-уведомление на странице брони</Label>
              <Textarea
                id="st-notice"
                name="bookingNotice"
                rows={2}
                defaultValue={settings?.bookingNotice ?? ""}
                placeholder="В пятницу и субботу бронь только по телефону…"
              />
            </div>

            <Button type="submit">Сохранить настройки</Button>
          </CardContent>
        </Card>
      </form>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Доступ</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Дев-админ: admin@ntm.ru / admin123. Перед продом смените пароль в БД
          (bcrypt) и задайте сильный AUTH_SECRET.
        </CardContent>
      </Card>
    </div>
  );
}
