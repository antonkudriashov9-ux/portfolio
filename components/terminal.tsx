"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { scrollToSection } from "@/providers";
import { siteConfig } from "@/lib/config";
import { projects } from "@/lib/projects";

type Output = string[];

const BANNER: Output = [
  "taskforge-shell v1.0 — интерактивный терминал портфолио",
  "введи help для списка команд",
  "",
];

function execute(raw: string): { output: Output; action?: () => void } {
  const cmd = raw.trim().toLowerCase();

  switch (cmd) {
    case "":
      return { output: [] };
    case "help":
      return {
        output: [
          "доступные команды:",
          "  whoami       — кто я",
          "  stack        — технологии",
          "  projects     — список проектов",
          "  contact      — как связаться",
          "  sudo hire-me — …попробуй",
          "  clear        — очистить экран",
        ],
      };
    case "whoami":
      return {
        output: [
          `${siteConfig.name} — ${siteConfig.role}, ${siteConfig.city}.`,
          `опыт: ${siteConfig.experienceYears} лет · открыт к предложениям`,
        ],
      };
    case "stack":
      return {
        output: [
          "frontend : React / Next.js / TypeScript / Tailwind",
          "backend  : Node.js / NestJS / PostgreSQL / Redis",
          "devops   : Docker / CI-CD / Vercel",
        ],
      };
    case "projects":
      return {
        output: projects.map((p) => `→ ${p.title} (${p.year}) — /projects/${p.slug}`),
        action: () => scrollToSection("#projects"),
      };
    case "contact":
      return {
        output: [`почта: ${siteConfig.email}`, "скроллю к контактам…"],
        action: () => scrollToSection("#contact"),
      };
    case "sudo hire-me":
    case "sudo hire_me":
      return {
        output: [
          "[sudo] проверка квалификации… ok",
          "доступ разрешён. переговорная через 5 минут.",
          "скроллю к контактам…",
        ],
        action: () => scrollToSection("#contact"),
      };
    case "clear":
      return { output: [] };
    default:
      return { output: [`команда не найдена: ${cmd} — попробуй help`] };
  }
}

export function Terminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Output>(BANNER);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onUi = () => setOpen(true);
    window.addEventListener("ui:terminal", onUi);
    return () => window.removeEventListener("ui:terminal", onUi);
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines, open]);

  const submit = useCallback(
    (raw: string) => {
      const { output, action } = execute(raw);
      setLines((prev) => [...prev, `➜ ~ ${raw}`, ...output]);
      if (raw.trim()) {
        setHistory((prev) => [raw.trim(), ...prev].slice(0, 50));
      }
      setHistIdx(-1);
      setValue("");
      if (action) window.setTimeout(action, 400);
    },
    []
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton
        className="max-w-xl gap-0 overflow-hidden rounded-xl! border-border bg-popover p-0"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Терминал</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-destructive/70" />
          <span className="size-2.5 rounded-full bg-chart-4/70" />
          <span className="size-2.5 rounded-full bg-primary/70" />
          <span className="ml-2 font-mono text-[11px] text-muted-foreground">
            ~/portfolio — zsh
          </span>
        </div>

        <div
          ref={bodyRef}
          className="h-72 space-y-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed"
          onClick={() => document.getElementById("terminal-input")?.focus()}
        >
          {lines.map((line, i) => (
            <p key={`${i}-${line}`} className={line.startsWith("➜") ? "text-foreground" : "text-muted-foreground"}>
              {line.startsWith("➜") ? (
                <>
                  <span className="text-primary">➜</span> ~ {line.slice(4)}
                </>
              ) : (
                line || "\u00A0"
              )}
            </p>
          ))}
        </div>

        <form
          className="flex items-center gap-2 border-t border-border px-4 py-3 font-mono text-[13px]"
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
        >
          <span className="text-primary">➜</span>
          <span className="text-muted-foreground">~</span>
          <input
            id="terminal-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                const next = Math.min(histIdx + 1, history.length - 1);
                if (next >= 0) {
                  setHistIdx(next);
                  setValue(history[next]);
                }
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                const next = histIdx - 1;
                setHistIdx(next);
                setValue(next >= 0 ? history[next] : "");
              }
            }}
            autoComplete="off"
            spellCheck={false}
            aria-label="Команда терминала"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground/50"
            placeholder="help"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
