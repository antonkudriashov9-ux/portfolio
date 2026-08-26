import { Star } from "lucide-react";
import { db } from "@/lib/db";
import { addReview, toggleReviewAnswered } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AutoSubmitForm } from "@/components/admin/auto-submit-form";
import { Switch } from "@/components/ui/switch";

export default async function AdminReviews() {
  const reviews = await db.review.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl">Отзывы</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Добавить отзыв вручную</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addReview} className="grid gap-4 sm:grid-cols-[1fr_1fr_120px]">
            <div>
              <Label htmlFor="rv-author">Автор</Label>
              <Input id="rv-author" name="author" required />
            </div>
            <div>
              <Label htmlFor="rv-source">Источник</Label>
              <Select name="source" defaultValue="YANDEX">
                <SelectTrigger id="rv-source" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YANDEX">Яндекс Карты</SelectItem>
                  <SelectItem value="2GIS">2ГИС</SelectItem>
                  <SelectItem value="TELEGRAM">Telegram</SelectItem>
                  <SelectItem value="OTHER">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rv-rating">Оценка</Label>
              <Select name="rating" defaultValue="5">
                <SelectTrigger id="rv-rating" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="rv-text">Текст</Label>
              <Textarea id="rv-text" name="text" rows={3} required />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit">Добавить</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            {reviews.length} отзывов · тумблер = отвечено
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {reviews.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{r.author}</p>
                    <span className="flex items-center gap-0.5" aria-label={`${r.rating} из 5`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={
                            i < r.rating ? "size-3 fill-primary text-primary" : "size-3 text-muted-foreground/40"
                          }
                        />
                      ))}
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {r.source}
                    </Badge>
                    {r.sentiment === "NEG" ? (
                      <Badge variant="destructive" className="font-mono text-[10px]">
                        негатив
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
                </div>
                <AutoSubmitForm action={toggleReviewAnswered} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="answered" value={r.answered ? "false" : "true"} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {r.answered ? "отвечен" : "ждёт"}
                  </span>
                  <Switch checked={r.answered} aria-label="Отвечен" />
                </AutoSubmitForm>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
