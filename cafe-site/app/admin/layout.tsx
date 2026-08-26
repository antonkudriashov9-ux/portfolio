import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { SidebarNav } from "@/components/admin/sidebar-nav";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const store = await cookies();
  const session = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-svh">
      <SidebarNav userName={session.name || session.email} />
      <div className="min-w-0 flex-1 bg-background">
        <div className="mx-auto max-w-6xl p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}
