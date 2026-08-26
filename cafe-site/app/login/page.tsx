"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Ошибка входа");
      toast.success("Добро пожаловать");
      router.push(params.get("from") ?? "/admin");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка входа");
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <UtensilsCrossed className="mx-auto mb-2 size-8 text-primary" />
        <CardTitle className="font-heading text-2xl">Не только макароны</CardTitle>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          панель управления
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Почта</Label>
            <Input id="email" name="email" type="email" placeholder="admin@ntm.ru" required autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Войти
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
