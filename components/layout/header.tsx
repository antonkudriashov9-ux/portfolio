"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Command as CommandIcon, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/providers";
import { navItems, siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

/** true только на клиенте после гидрации — без setState в эффекте */
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Переключить тему"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "light" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    setMenuOpen(false);
    scrollToSection(`#${id}`);
  };

  const openCommand = () => {
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent("ui:command"));
  };

  const initials = siteConfig.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toLowerCase();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[80]">
        <div
          className={cn(
            "mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-xl border px-4 py-2.5 transition-colors duration-300 md:mx-6 lg:mx-auto",
            scrolled
              ? "border-border bg-background/75 shadow-lg shadow-black/5 backdrop-blur-md"
              : "border-transparent bg-transparent"
          )}
        >
          <button
            onClick={() => scrollToSection(0)}
            className="font-mono text-sm font-semibold tracking-tight"
            aria-label="Наверх"
          >
            {initials}
            <span className="text-primary">.</span>dev
          </button>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Основная навигация">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className="relative font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:text-foreground hover:after:w-full"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={openCommand}
              className="gap-2 font-mono text-[11px]"
              aria-label="Открыть командную палитру"
            >
              <CommandIcon className="size-3.5" />
              <span className="hidden sm:inline">K</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Меню"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-[75] flex flex-col items-center justify-center gap-2 bg-background/95 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {navItems.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i, duration: 0.35 }}
                onClick={() => go(item.id)}
                className="py-3 font-heading text-3xl font-bold uppercase text-foreground"
              >
                {item.label}
              </motion.button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
