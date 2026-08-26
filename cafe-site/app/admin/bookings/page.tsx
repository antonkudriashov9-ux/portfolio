import Link from "next/link";
import { db } from "@/lib/db";
import { setBookingStatus } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AutoSubmitForm } from "@/components/admin/auto-submit-form";

export const STATUS_LABEL: Record<string, string> = {
  NEW: "новая",
  CONFIRMED: "подтверждена",
  SEATED: "гость пришёл",
  NOSHOW: "не пришёл",
  CANCELLED: "отменена",
};

const STATUSES = ["NEW", "CONFIRMED", "SEATED", "NOSHOW", "CANCELLED"] as const;

export default async function AdminBookings({
  searchParams,
}: PageProps<"/admin/bookings">) {
  const sp = await searchParams;
  const locationFilter = typeof sp.location === "string" ? sp.location : undefined;
  const statusFilter = typeof sp.status === "string" ? sp.status : undefined;

  const [locations, bookings] = await Promise.all([
    db.location.findMany({ orderBy: { sortOrder: "asc" } }),
    db.booking.findMany({
      where: {
        ...(locationFilter ? { location: { slug: locationFilter } } : {}),
        ...(statusFilter && STATUSES.includes(statusFilter as (typeof STATUSES)[number])
          ? { status: statusFilter }
          : {}),
      },
      orderBy: [{ date: "desc" }, { time: "desc" }],
      take: 100,
      include: { location: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl">Бронирования</h1>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-3">
        <form className="w-56">
          <Select name="location" defaultValue={locationFilter ?? "all"}>
            <SelectTrigger aria-label="Точка">
              <SelectValue placeholder="Все точки" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все точки</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l.id} value={l.slug}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button type="submit" className="sr-only">применить</button>
        </form>
        <form className="w-52">
          <Select name="status" defaultValue={statusFilter ?? "all"}>
            <SelectTrigger aria-label="Статус">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button type="submit" className="sr-only">применить</button>
        </form>
        {locationFilter || statusFilter ? (
          <Link
            href="/admin/bookings"
            className="self-center font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            сбросить
          </Link>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            {bookings.length} броней
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Пусто</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Гость</TableHead>
                  <TableHead>Точка</TableHead>
                  <TableHead>Когда</TableHead>
                  <TableHead>Гостей</TableHead>
                  <TableHead>Комментарий</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <p className="font-medium">{b.guestName}</p>
                      <p className="font-mono text-xs text-muted-foreground">{b.guestPhone}</p>
                    </TableCell>
                    <TableCell className="text-sm">{b.location.name}</TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-sm">
                      {b.date} · {b.time}
                    </TableCell>
                    <TableCell>{b.guestsCount}</TableCell>
                    <TableCell className="max-w-52 truncate text-sm text-muted-foreground">
                      {b.comment ?? "—"}
                    </TableCell>
                    <TableCell>
                      <AutoSubmitForm action={setBookingStatus} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={b.id} />
                        <Select name="status" defaultValue={b.status}>
                          <SelectTrigger className="h-8 w-44" aria-label="Статус брони">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {STATUS_LABEL[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </AutoSubmitForm>
                      {b.status === "NEW" ? (
                        <Badge className="mt-1" variant="default">
                          новая
                        </Badge>
                      ) : null}
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
