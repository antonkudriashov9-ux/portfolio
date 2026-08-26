import { SmoothScroll } from "@/providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </SmoothScroll>
  );
}
