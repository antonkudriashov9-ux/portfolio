import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CalendarX2,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_LABEL: Record<string, string> = {
  NEW: "новая",
  CONFIRMED: "подтверждена",
  SEATED: "гость пришёл",
  NOSHOW: "не пришёл",
  CANCELLED: "отменена",
};

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function AdminDashboard() {
  const today = todayString();

  const [bookingsToday, pendingCount, guestsCount, dishesCount, unavailableCount, negativeReviews, latestBookings] =
    await Promise.all([
      db.booking.count({ where: { date: today, status: { not: "CANCELLED" } } }),
      db.booking.count({ where: { status: "NEW" } }),
      db.guest.count(),
      db.dish.count(),
      db.dish.count({ where: { available: false } }),
      db.review.count({ where: { sentiment: "NEG", answered: false } }),
      db.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { location: true },
      }),
    ]);

  const kpis = [
    { title: "Брони на сегодня", value: bookingsToday, icon: CalendarDays },
    { title: "Новые заявки", value: pendingCount, icon: CalendarX2 },
    { title: "Гостей в базе", value: guestsCount, icon: Users },
    { title: "Блюд в меню", value: dishesCount, icon: UtensilsCrossed },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl">Дашборд</h1>
        <p className="mt-1 text-sm text-muted-foreground">Сводка за {today}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ title, value, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <Icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {unavailableCount > 0 || negativeReviews > 0 ? (
        <div className="space-y-2">
          {unavailableCount > 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
              <UtensilsCrossed className="size-4 text-primary" />
              {unavailableCount} блюд(о) скрыто из меню как «нет в наличии»
            </div>
          ) : null}
          {negativeReviews > 0 ? (
            <Link
              href="/admin/reviews"
              className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm transition-colors hover:bg-destructive/10"
            >
              <AlertTriangle className="size-4 text-destructive" />
              {negativeReviews} негативных отзывов ждут ответа
            </Link>
          ) : null}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Последние брони</CardTitle>
        </CardHeader>
        <CardContent>
          {latestBookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Броней пока нет — они появятся здесь после первой заявки с сайта
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Гость</TableHead>
                  <TableHead>Точка</TableHead>
                  <TableHead>Когда</TableHead>
                  <TableHead>Гостей</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestBookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <p className="font-medium">{b.guestName}</p>
                      <p className="font-mono text-xs text-muted-foreground">{b.guestPhone}</p>
                    </TableCell>
                    <TableCell className="text-sm">{b.location.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {b.date} · {b.time}
                    </TableCell>
                    <TableCell>{b.guestsCount}</TableCell>
                    <TableCell>
                      <Badge variant={b.status === "NEW" ? "default" : "outline"}>
                        {STATUS_LABEL[b.status] ?? b.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
