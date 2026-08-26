"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface LocationLite {
  slug: string;
  name: string;
  address: string;
  hours: string;
}

interface Slot {
  time: string;
  left: number;
}

interface Done {
  location: string;
  date: string;
  time: string;
  guestsCount: number;
}

const STEP_TITLES = ["Точка", "Дата и время", "Контакты"];

function buildDateChips() {
  const days: { value: string; label: string; weekday: string }[] = [];
  const wd = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      label: i === 0 ? "сегодня" : i === 1 ? "завтра" : String(d.getDate()),
      weekday: wd[d.getDay()],
    });
  }
  return days;
}

function BookingFlowInner({ locations }: { locations: LocationLite[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const preselected = params.get("location");

  const [step, setStep] = useState(0);
  const [locationSlug, setLocationSlug] = useState<string | null>(
    preselected && locations.some((l) => l.slug === preselected) ? preselected : null
  );
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [guestsCount, setGuestsCount] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  const selected = locations.find((l) => l.slug === locationSlug) ?? null;
  const chips = buildDateChips();

  const loadSlots = useCallback(async (slug: string, d: string) => {
    setSlotsLoading(true);
    setTime(null);
    try {
      const res = await fetch(`/api/availability?location=${slug}&date=${d}`);
      const json = await res.json();
      setSlots(json.slots ?? []);
    } catch {
      toast.error("Не удалось загрузить свободные слоты");
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (step === 1 && locationSlug && date) {
      const id = requestAnimationFrame(() => loadSlots(locationSlug, date));
      return () => cancelAnimationFrame(id);
    }
  }, [step, locationSlug, date, loadSlots]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!locationSlug || !date || !time) return;
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationSlug,
          date,
          time,
          guestsCount,
          name: form.get("name"),
          phone: form.get("phone"),
          comment: String(form.get("comment") ?? "") || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Не удалось забронировать");
      setDone(json.booking as Done);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-primary/30 bg-primary/5 p-10 text-center"
      >
        <CheckCircle2 className="mx-auto size-12 text-primary" />
        <h2 className="mt-4 font-heading text-3xl">Столик закреплён</h2>
        <p className="mt-3 text-muted-foreground">
          {done.location} · {done.date} в {done.time} · на {done.guestsCount} гостя
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Менеджер перезвонит для подтверждения.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => router.push("/")}>
          На главную
        </Button>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Прогресс */}
      <ol className="mb-10 flex items-center gap-2" aria-label="Шаги бронирования">
        {STEP_TITLES.map((title, i) => (
          <li key={title} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full border font-mono text-xs",
                i < step
                  ? "border-primary bg-primary text-primary-foreground"
                  : i === step
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
              )}
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span
              className={cn(
                "hidden font-mono text-[11px] uppercase tracking-widest sm:inline",
                i === step ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {title}
            </span>
            {i < STEP_TITLES.length - 1 ? <span className="h-px flex-1 bg-border" aria-hidden /> : null}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="s0"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {locations.map((loc) => (
              <button
                key={loc.slug}
                onClick={() => {
                  setLocationSlug(loc.slug);
                  setStep(1);
                }}
                className={cn(
                  "rounded-3xl border p-7 text-left transition-all hover:border-primary/50 hover:bg-card",
                  locationSlug === loc.slug && "border-primary bg-primary/5"
                )}
              >
                <MapPin className="size-6 text-primary" />
                <p className="mt-4 font-heading text-2xl">{loc.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">{loc.address}</p>
                <p className="mt-3 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {loc.hours}
                </p>
              </button>
            ))}
          </motion.div>
        ) : null}

        {step === 1 ? (
          <motion.div
            key="s1"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex gap-2 overflow-x-auto pb-2">
              {chips.map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => setDate(chip.value)}
                  className={cn(
                    "shrink-0 rounded-2xl border px-5 py-3 text-center transition-all",
                    date === chip.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <span className="block font-heading text-lg">{chip.label}</span>
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {chip.weekday}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-8 min-h-40">
              {!date ? (
                <p className="text-sm text-muted-foreground">Выберите дату ↑</p>
              ) : slotsLoading ? (
                <Loader2 className="size-6 animate-spin text-primary" />
              ) : slots && slots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={slot.left === 0}
                      onClick={() => setTime(slot.time)}
                      className={cn(
                        "rounded-xl border px-2 py-3 text-center transition-all",
                        slot.left === 0
                          ? "cursor-not-allowed border-border/50 text-muted-foreground/40 line-through"
                          : time === slot.time
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="block font-mono text-sm">{slot.time}</span>
                      <span className="block text-[10px] opacity-70">
                        {slot.left === 0 ? "занято" : `св. ${slot.left}`}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">На этот день свободных слотов нет</p>
              )}
            </div>

            <div className="mt-10 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>
                <ArrowLeft className="size-4" />
                Точка
              </Button>
              <Button disabled={!time} onClick={() => setStep(2)}>
                Контакты
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </motion.div>
        ) : null}

        {step === 2 ? (
          <motion.form
            key="s2"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            onSubmit={submit}
            className="max-w-lg space-y-5"
          >
            <div className="rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4 font-mono text-sm">
              {selected?.name} · {date} в {time}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="ml-3 text-primary underline underline-offset-4"
              >
                изменить
              </button>
            </div>

            <div>
              <Label>Гостей</Label>
              <div className="mt-2 flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Меньше гостей"
                  onClick={() => setGuestsCount((v) => Math.max(1, v - 1))}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-10 text-center font-heading text-2xl">{guestsCount}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Больше гостей"
                  onClick={() => setGuestsCount((v) => Math.min(20, v + 1))}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="bk-name">Имя</Label>
                <Input id="bk-name" name="name" required minLength={2} placeholder="Как вас зовут" />
              </div>
              <div>
                <Label htmlFor="bk-phone">Телефон</Label>
                <Input id="bk-phone" name="phone" type="tel" required placeholder="+7 ___ ___-__-__" />
              </div>
            </div>

            <div>
              <Label htmlFor="bk-comment">Пожелания</Label>
              <Textarea
                id="bk-comment"
                name="comment"
                rows={3}
                placeholder="Столик у окна, детский стульчик, торт…"
              />
            </div>

            <div className="flex justify-between pt-2">
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="size-4" />
                Назад
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                Забронировать
              </Button>
            </div>
          </motion.form>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function BookingFlow({ locations }: { locations: LocationLite[] }) {
  return (
    <Suspense fallback={<Loader2 className="size-6 animate-spin text-primary" />}>
      <BookingFlowInner locations={locations} />
    </Suspense>
  );
}
