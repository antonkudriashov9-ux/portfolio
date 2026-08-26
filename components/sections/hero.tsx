"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/fx/magnetic-button";
import { ScrambleText } from "@/components/fx/scramble-text";
import { scrollToSection } from "@/providers";
import { siteConfig } from "@/lib/config";

const KineticMatrix = dynamic(
  () => import("@/components/ui/kinetic-matrix").then((m) => m.KineticMatrix),
  { ssr: false }
);

function useLocalClock() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

function usePointerHud() {
  const [coords, setCoords] = useState({ x: "0000", y: "0000" });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setCoords({
        x: String(Math.round(e.clientX)).padStart(4, "0"),
        y: String(Math.round(e.clientY)).padStart(4, "0"),
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return coords;
}

export function Hero() {
  const clock = useLocalClock();
  const hud = usePointerHud();
  const [spacing] = useState(
    () => (typeof window !== "undefined" && window.innerWidth < 768 ? 64 : 52)
  );

  return (
    <section id="top" className="relative flex h-svh min-h-[640px] items-center overflow-hidden">
      {/* Физическая решётка из heroes.txt */}
      <KineticMatrix title="" className="absolute inset-0 z-0" spacing={spacing} />

      {/* Плавные переходы в шапку и следующую секцию */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-28 bg-gradient-to-b from-background/90 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-36 bg-gradient-to-t from-background to-transparent" />

      {/* Контент поверх физики */}
      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-6xl px-4 md:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {"// full stack developer — "}
          {siteConfig.city}
        </p>

        <h1 className="mt-4 font-heading text-[clamp(2.6rem,9vw,8rem)] leading-[0.95] font-extrabold uppercase tracking-tight">
          <ScrambleText text={siteConfig.name} delay={700} />
        </h1>

        <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
          Проектирую и запускаю веб-продукты целиком: от API до интерфейса.
          Ниже — живые демо моих проектов, а не скриншоты.
        </p>

        <div className="mt-5 flex items-center gap-2.5 rounded-full border border-border bg-card/60 px-3.5 py-1.5 font-mono text-xs backdrop-blur-sm w-fit">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full rounded-full bg-primary animate-signal-ping" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          открыт к предложениям
        </div>

        <div className="pointer-events-auto mt-9 flex flex-wrap items-center gap-3">
          <MagneticButton>
            <Button size="lg" onClick={() => scrollToSection("#projects")}>
              Смотреть проекты
              <ArrowDown className="size-4" />
            </Button>
          </MagneticButton>
          <MagneticButton>
            <Button size="lg" variant="outline" onClick={() => scrollToSection("#contact")}>
              Связаться
            </Button>
          </MagneticButton>
        </div>
      </div>

      {/* HUD по углам */}
      <div className="pointer-events-none absolute inset-0 z-10 hidden font-mono text-[11px] text-muted-foreground/80 md:block" aria-hidden>
        <p className="absolute left-6 top-24 tabular-nums">
          X:{hud.x} Y:{hud.y}
        </p>
        <p className="absolute right-6 top-24 tabular-nums">
          {`${siteConfig.city} // ${clock}`}
        </p>
        <p className="absolute bottom-6 left-6 flex items-center gap-1.5">
          scroll
          <ArrowDown className="size-3 animate-bounce" />
        </p>
        <p className="absolute right-6 bottom-6">{`v2.0 // ©${new Date().getFullYear()}`}</p>
      </div>
    </section>
  );
}
