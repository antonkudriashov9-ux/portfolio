import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Prata } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const prata = Prata({
  subsets: ["latin", "cyrillic"],
  variable: "--font-prata",
  weight: "400",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://netolkomakarony.example.com"),
  title: {
    default: "Не только макароны — ресторан в Липецке",
    template: "%s — Не только макароны",
  },
  description:
    "Авторская паста с выбором формы, пицца из печи, стейки и завтраки с 8 утра. Две точки в Липецке: Зегеля, 23А и Свиридова, 22/2. Бронирование онлайн.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    title: "Не только макароны — ресторан в Липецке",
    description: "Авторская паста, пицца из печи, завтраки с 8 утра. Бронируйте столик онлайн.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#12100c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${prata.variable} ${manrope.variable} ${jetbrains.variable} h-full antialiased dark`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
