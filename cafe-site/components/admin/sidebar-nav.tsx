"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Settings,
  Star,
  UtensilsCrossed,
  Users,
  Image as ImageIcon,
  PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Бронирования", icon: CalendarDays },
  { href: "/admin/guests", label: "Гости", icon: Users },
  { href: "/admin/menu", label: "Меню", icon: UtensilsCrossed },
  { href: "/admin/media", label: "Медиатека", icon: ImageIcon },
  { href: "/admin/events", label: "Банкеты", icon: PartyPopper },
  { href: "/admin/reviews", label: "Отзывы", icon: Star },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

export function SidebarNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="border-b border-border px-5 py-5">
        <p className="font-heading text-lg leading-tight">Не только макароны</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          CRM · {userName}
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ExternalLink className="size-4" />
          Открыть сайт
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="size-4" />
          Выйти
        </button>
      </div>
    </aside>
  );
}
