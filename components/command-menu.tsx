"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Copy,
  FileDown,
  Layers,
  Link2,
  MonitorPlay,
  Moon,
  Sparkles,
  Sun,
  TerminalSquare,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { scrollToSection } from "@/providers";
import { navItems, siteConfig } from "@/lib/config";
import { projects } from "@/lib/projects";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onUi = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("ui:command", onUi);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ui:command", onUi);
    };
  }, []);

  const run = useCallback(
    (action: () => void) => {
      setOpen(false);
      window.setTimeout(action, 80);
    },
    []
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Меню" description="Командная палитра">
      <CommandInput placeholder="Введи команду или запрос…" />
      <CommandList>
        <CommandEmpty>Ничего не найдено.</CommandEmpty>

        <CommandGroup heading="Разделы">
          {navItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => run(() => scrollToSection(`#${item.id}`))}
            >
              <Link2 />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Проекты">
          {projects.map((p) => (
            <CommandItem
              key={`p-${p.slug}`}
              onSelect={() => run(() => router.push(`/projects/${p.slug}`))}
            >
              <Layers />
              {p.title}
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                /{p.year}
              </span>
            </CommandItem>
          ))}
          {projects.map((p) => (
            <CommandItem
              key={`d-${p.slug}`}
              onSelect={() => run(() => router.push(`/projects/${p.slug}/demo`))}
            >
              <MonitorPlay />
              {p.title} — живое демо
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Действия">
          <CommandItem
            onSelect={() =>
              run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))
            }
          >
            {resolvedTheme === "dark" ? <Sun /> : <Moon />}
            Переключить тему
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              navigator.clipboard
                .writeText(siteConfig.email)
                .then(() => toast.success("Почта скопирована"))
                .catch(() => toast.error("Не удалось скопировать"));
            }}
          >
            <Copy />
            Скопировать почту
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                scrollToSection(0);
                window.dispatchEvent(new CustomEvent("kinetic:pulse"));
              })
            }
          >
            <Sparkles />
            Импульс
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => window.dispatchEvent(new CustomEvent("ui:terminal")))
            }
          >
            <TerminalSquare />
            Терминал
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => toast.info("Добавь резюме в public/cv.pdf — ссылка появится автоматически"))
            }
          >
            <FileDown />
            Скачать CV
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
