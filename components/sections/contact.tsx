"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowUpRight, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { SectionHeading } from "@/components/fx/section-heading";
import { Reveal } from "@/components/fx/reveal";
import { MagneticButton } from "@/components/fx/magnetic-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/lib/config";

const schema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  email: z.email("Некорректная почта"),
  message: z.string().min(10, "Расскажи чуть подробнее (10+ символов)"),
});

type FormData = z.infer<typeof schema>;

const SOCIALS = [
  { label: "telegram", href: siteConfig.telegram },
  { label: "github", href: siteConfig.github },
  { label: "linkedin", href: siteConfig.linkedin },
];

export function Contact() {
  const [sending, setSending] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const copyEmail = () => {
    navigator.clipboard
      .writeText(siteConfig.email)
      .then(() => toast.success("Почта скопирована"))
      .catch(() => toast.error("Не удалось скопировать"));
  };

  const onSubmit = async (data: FormData) => {
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Сообщение отправлено — отвечу в течение дня");
      form.reset();
    } catch {
      toast.error("Что-то пошло не так. Попробуй написать напрямую на почту");
    } finally {
      setSending(false);
    }
  };

  const err = (msg?: string) =>
    msg ? <p className="mt-1 text-xs text-destructive">{msg}</p> : null;

  return (
    <section id="contact" className="scroll-mt-24 bg-blueprint">
      <div className="mx-auto max-w-6xl px-4 py-24 md:px-6">
        <SectionHeading
          index="04"
          label="контакты"
          title="Давайте работать вместе"
          description="Есть задача или проект? Напиши — отвечаю в течение дня."
        />

        <Reveal>
          <button
            onClick={copyEmail}
            data-cursor-label="Копировать"
            className="group block max-w-full break-all text-left font-heading text-[clamp(1.35rem,5.5vw,4rem)] leading-tight font-bold uppercase decoration-2 underline-offset-8 decoration-transparent transition-colors hover:decoration-primary"
            aria-label={`Скопировать почту ${siteConfig.email}`}
          >
            {siteConfig.email}
            <Copy className="ml-3 inline size-[0.55em] align-baseline opacity-0 transition-opacity group-hover:opacity-60" />
          </button>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap gap-6">
            {SOCIALS.map((s) => (
              <MagneticButton key={s.label} strength={0.25}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 border-b border-border pb-1 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {s.label}
                  <ArrowUpRight className="size-3.5" />
                </a>
              </MagneticButton>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-14 max-w-xl space-y-4 rounded-2xl border bg-card p-6"
            noValidate
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {"// быстрая форма"}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cf-name" className="mb-1.5 block font-mono text-xs text-muted-foreground">
                  имя
                </label>
                <Input id="cf-name" placeholder="Как к тебе обращаться" {...form.register("name")} />
                {err(form.formState.errors.name?.message)}
              </div>
              <div>
                <label htmlFor="cf-email" className="mb-1.5 block font-mono text-xs text-muted-foreground">
                  почта
                </label>
                <Input id="cf-email" type="email" placeholder="you@company.com" {...form.register("email")} />
                {err(form.formState.errors.email?.message)}
              </div>
            </div>

            <div>
              <label htmlFor="cf-message" className="mb-1.5 block font-mono text-xs text-muted-foreground">
                сообщение
              </label>
              <Textarea
                id="cf-message"
                rows={5}
                placeholder="Пара слов о задаче…"
                {...form.register("message")}
              />
              {err(form.formState.errors.message?.message)}
            </div>

            <Button type="submit" disabled={sending} className="w-full sm:w-auto">
              {sending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Отправляю…
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Отправить
                </>
              )}
            </Button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
