import { db } from "@/lib/db";
import { toggleInGallery, uploadMedia } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AutoSubmitForm } from "@/components/admin/auto-submit-form";
import { Switch } from "@/components/ui/switch";

export default async function AdminMedia() {
  const items = await db.mediaItem.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const settings = await db.settings.findUnique({ where: { id: "global" } });

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl">Медиатека</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Загрузить фото или видео</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={uploadMedia} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-64">
              <Label htmlFor="up-title">Подпись</Label>
              <Input id="up-title" name="title" placeholder="Открытие Зегеля" />
            </div>
            <div className="flex-1 min-w-64">
              <Label htmlFor="up-file">Файл (до 50 МБ)</Label>
              <Input id="up-file" name="file" type="file" accept="image/*,video/mp4,video/webm" required />
            </div>
            <Button type="submit">Загрузить</Button>
          </form>
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            видео mp4/webm из медиатеки можно поставить героем на странице «Настройки»
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            {items.length} файлов · переключатель = показывать в галерее сайта
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-xl border">
                {item.kind === "video" ? (
                  <div className="grid aspect-video place-items-center bg-muted font-mono text-xs text-muted-foreground">
                    видео
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.title ?? ""} className="aspect-square w-full object-cover" />
                )}
                <div className="flex items-center justify-between gap-2 p-3">
                  <span className="truncate font-mono text-[11px] text-muted-foreground">
                    {item.title ?? item.url}
                  </span>
                  <AutoSubmitForm action={toggleInGallery}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="inGallery" value={item.inGallery ? "false" : "true"} />
                    <Switch checked={item.inGallery} aria-label="В галерее" />
                  </AutoSubmitForm>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Hero-видео
            {settings?.heroVideoUrl ? (
              <Badge variant="default">активно</Badge>
            ) : (
              <Badge variant="outline">не задано</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Сейчас герой работает на фотослайдере. Загрузите видео выше и вставьте его URL
            (вида <code className="font-mono">/uploads/файл.mp4</code>) в Настройках — герой переключится на видео.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
