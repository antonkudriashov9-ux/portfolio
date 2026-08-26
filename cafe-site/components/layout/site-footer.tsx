import Link from "next/link";
import { MessageCircle, Phone, Send } from "lucide-react";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-heading text-2xl leading-tight">
            Не только <span className="text-primary">макароны</span>
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            {site.latin} · авторская паста, пицца из печи и завтраки с 8 утра.
            {site.award ? ` ${site.award}.` : ""}
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={site.telegram}
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
              className="grid size-10 place-items-center rounded-full border transition-colors hover:border-primary hover:text-primary"
            >
              <Send className="size-4" />
            </a>
            <a
              href={site.vk}
              target="_blank"
              rel="noreferrer"
              aria-label="ВКонтакте"
              className="grid size-10 place-items-center rounded-full border transition-colors hover:border-primary hover:text-primary"
            >
              <span className="font-mono text-xs font-bold">VK</span>
            </a>
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="grid size-10 place-items-center rounded-full border transition-colors hover:border-primary hover:text-primary"
            >
              <MessageCircle className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Навигация
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ["/menu", "Меню"],
              ["/gallery", "Галерея"],
              ["/locations", "Адреса"],
              ["/events", "Банкеты и события"],
              ["/booking", "Бронирование"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Контакты
          </p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>ул. Зегеля, 23А · +7 958 654-38-63</li>
            <li>ул. Свиридова, 22/2 · +7 958 654-38-68</li>
            <li>Ежедневно 08:00 – 23:00</li>
          </ul>
          <a
            href={site.phoneMainHref}
            className="mt-4 inline-flex items-center gap-2 text-sm text-primary transition-opacity hover:opacity-80"
          >
            <Phone className="size-4" />
            Позвонить
          </a>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 font-mono text-[11px] text-muted-foreground md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} Не только макароны · {site.city}</p>
          <p>Доставка — на Яндекс Еде</p>
        </div>
      </div>
    </footer>
  );
}
