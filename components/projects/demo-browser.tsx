"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Lock,
  Monitor,
  RotateCw,
  ShieldAlert,
  Smartphone,
  Tablet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

type Device = "desktop" | "tablet" | "mobile";

const DEVICES: Array<{
  id: Device;
  label: string;
  icon: typeof Monitor;
  width: number | null;
}> = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: null },
  { id: "tablet", label: "Tablet", icon: Tablet, width: 768 },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: 390 },
];

export function DemoBrowser({ project }: { project: Project }) {
  const [device, setDevice] = useState<Device>("desktop");
  const [frame, setFrame] = useState({ key: 0, loaded: false, blocked: false });
  const [scale, setScale] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);

  const activeDevice = DEVICES.find((d) => d.id === device)!;
  const frameSrc = project.embedUrl ?? project.liveUrl;

  const reload = () =>
    setFrame(({ key }) => ({ key: key + 1, loaded: false, blocked: false }));

  useEffect(() => {
    loadedRef.current = false;
    timerRef.current = window.setTimeout(() => {
      setFrame((s) =>
        s.key === frame.key && !loadedRef.current ? { ...s, blocked: true } : s
      );
    }, 8000);
    return () => window.clearTimeout(timerRef.current);
  }, [frame.key]);
  const host = (() => {
    try {
      return new URL(project.liveUrl).hostname;
    } catch {
      return project.liveUrl;
    }
  })();

  useEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      const w = activeDevice.width;
      if (!el || !w) {
        setScale(1);
        return;
      }
      const available = el.clientWidth - 32;
      setScale(Math.min(1, available / w));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeDevice]);

  const onLoad = () => {
    loadedRef.current = true;
    window.clearTimeout(timerRef.current);
    setFrame((s) => ({ ...s, loaded: true }));
  };

  return (
    <div className="flex h-svh flex-col bg-background">
      {/* Панель «браузера» */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 md:gap-3">
        <div className="hidden items-center gap-1.5 sm:flex" aria-hidden>
          <span className="size-2.5 rounded-full bg-destructive/70" />
          <span className="size-2.5 rounded-full bg-chart-4/70" />
          <span className="size-2.5 rounded-full bg-primary/70" />
        </div>

        <Button asChild variant="ghost" size="icon-sm" aria-label="Назад к проекту">
          <Link href={`/projects/${project.slug}`}>
            <ArrowLeft />
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Перезагрузить"
          onClick={reload}
        >
          <RotateCw />
        </Button>

        <div className="mx-auto flex min-w-0 flex-1 items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 font-mono text-xs sm:max-w-md">
          <Lock className="size-3 shrink-0 text-primary" />
          <span className="truncate text-muted-foreground">{project.liveUrl}</span>
        </div>

        <div className="hidden items-center rounded-lg border p-0.5 md:flex" role="group" aria-label="Устройство просмотра">
          {DEVICES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setDevice(id)}
              aria-pressed={device === id}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] transition-colors",
                device === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        <Button asChild variant="outline" size="sm" className="shrink-0">
          <a href={project.liveUrl} target="_blank" rel="noreferrer">
            <ExternalLink />
            <span className="hidden lg:inline">В новой вкладке</span>
          </a>
        </Button>
      </div>

      {/* Viewport */}
      <div ref={containerRef} className="h-full flex-1 overflow-hidden bg-muted/20 p-4">
        <div
          className="relative mx-auto h-full"
          style={{
            width: activeDevice.width ?? "100%",
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            height: scale < 1 ? `calc((100% ) / ${scale})` : "100%",
          }}
        >
          <iframe
            key={frame.key}
            src={frameSrc}
            title={`${project.title} — живое демо`}
            onLoad={onLoad}
            sandbox="allow-forms allow-popups allow-scripts"
            referrerPolicy="no-referrer"
            className="absolute inset-0 size-full rounded-xl border border-border bg-white shadow-2xl shadow-black/20"
          />

          {!frame.loaded && !frame.blocked ? (
            <div className="absolute inset-0 grid place-items-center rounded-xl border border-border bg-card">
              <div className="flex flex-col items-center gap-3 font-mono text-xs text-muted-foreground">
                <RotateCw className="size-5 animate-spin text-primary" />
                загружаю {project.title}…
              </div>
            </div>
          ) : null}

          {frame.blocked ? (
            <div className="absolute inset-0 grid place-items-center rounded-xl border border-border bg-card p-8">
              <div className="max-w-sm space-y-4 text-center">
                <ShieldAlert className="mx-auto size-10 text-muted-foreground" />
                <p className="font-heading text-lg font-bold">Сайт запретил встраивание</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-mono">{host}</span> отправляет заголовок{" "}
                  <span className="font-mono text-primary">X-Frame-Options</span> и не
                  разрешает показывать себя внутри другой страницы.
                </p>
                <div className="flex justify-center gap-2 pt-1">
                  <Button asChild>
                    <a href={project.liveUrl} target="_blank" rel="noreferrer">
                      <ExternalLink />
                      Открыть в новой вкладке
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/projects/${project.slug}`}>К проекту</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
