import type { Metadata, Viewport } from "next";
import { Golos_Text, JetBrains_Mono, Unbounded } from "next/font/google";
import { Providers } from "@/providers";
import { Preloader } from "@/components/layout/preloader";
import { CustomCursor } from "@/components/layout/custom-cursor";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
  display: "swap",
});

const golos = Golos_Text({
  subsets: ["latin", "cyrillic"],
  variable: "--font-golos",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.role}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: `Портфолио ${siteConfig.role}: живые демо проектов, стек, опыт. ${siteConfig.city}.`,
  keywords: ["full stack разработчик", "портфолио", "веб-разработчик", siteConfig.city],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteConfig.url,
    siteName: `${siteConfig.name} — ${siteConfig.role}`,
    title: `${siteConfig.name} — ${siteConfig.role}`,
    description: `Живые демо проектов, стек и опыт full stack разработчика.`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.role}`,
    description: `Живые демо проектов, стек и опыт full stack разработчика.`,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#06080d",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.name,
  jobTitle: siteConfig.role,
  email: `mailto:${siteConfig.email}`,
  url: siteConfig.url,
  sameAs: [siteConfig.github, siteConfig.telegram, siteConfig.linkedin],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${unbounded.variable} ${golos.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          <Preloader />
          <CustomCursor />
          {children}
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
