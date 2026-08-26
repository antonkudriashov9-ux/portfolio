"use client";

import { ArrowUp, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/providers";
import { siteConfig } from "@/lib/config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 font-mono text-xs text-muted-foreground md:flex-row md:px-6">
        <p>
          © {year} {siteConfig.name} · собрано на Next.js + React 19
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="font-mono"
            onClick={() => window.dispatchEvent(new CustomEvent("ui:terminal"))}
            aria-label="Открыть терминал"
          >
            <TerminalSquare className="size-3.5" />
            терминал
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Наверх"
            onClick={() => scrollToSection(0)}
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </footer>
  );
}
