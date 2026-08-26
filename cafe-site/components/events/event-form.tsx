"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EventForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const guestsRaw = String(form.get("guestsCount") ?? "");
    const dateRaw = String(form.get("date") ?? "");

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          eventType: form.get("eventType"),
          guestsCount: guestsRaw ? Number(guestsRaw) : null,
          date: dateRaw || null,
          comment: String(form.get("comment") ?? "") || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Ошибка отправки");
      toast.success("Заявка отправлена — перезвоним в течение дня");
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-3xl border border-primary/30 bg-primary/5 p-8 text-center">
        <PartyPopper className="size-10 text-primary" />
        <p className="mt-4 font-heading text-2xl">Заявка принята</p>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Менеджер свяжется с вами в течение дня, чтобы обсудить детали.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border bg-card p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ev-name">Имя</Label>
          <Input id="ev-name" name="name" required minLength={2} placeholder="Как к вам обращаться" />
        </div>
        <div>
          <Label htmlFor="ev-phone">Телефон</Label>
          <Input id="ev-phone" name="phone" type="tel" required placeholder="+7 ___ ___-__-__" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ev-type">Событие</Label>
          <Select name="eventType" defaultValue="День рождения">
            <SelectTrigger id="ev-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Свадьба">Свадьба</SelectItem>
              <SelectItem value="День рождения">День рождения</SelectItem>
              <SelectItem value="Корпоратив">Корпоратив</SelectItem>
              <SelectItem value="Другое">Другое</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="ev-guests">Гостей (примерно)</Label>
          <Input id="ev-guests" name="guestsCount" type="number" min={1} max={500} placeholder="35" />
        </div>
      </div>

      <div>
        <Label htmlFor="ev-date">Дата (если известна)</Label>
        <Input id="ev-date" name="date" type="date" />
      </div>

      <div>
        <Label htmlFor="ev-comment">Пожелания</Label>
        <Textarea id="ev-comment" name="comment" rows={4} placeholder="Меню, музыка, декор…" />
      </div>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        Отправить заявку
      </Button>
    </form>
  );
}
