import { Cake } from "lucide-react";
import { db } from "@/lib/db";
import { updateGuest } from "@/app/admin/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GuestEditDialog } from "@/components/admin/guest-edit-dialog";

export default async function AdminGuests() {
  const [guests, today] = await Promise.all([
    db.guest.findMany({
      orderBy: { createdAt: "desc" },
      include: { bookings: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    new Date(),
  ]);

  const mmdd = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const birthdayPeople = guests.filter(
    (g) => g.birthday && `${String(g.birthday.getMonth()).padStart(2, "0")}-${String(g.birthday.getDate()).padStart(2, "0")}` === mmdd
  );

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl">Гости</h1>

      {birthdayPeople.length > 0 ? (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Cake className="size-5 text-primary" />
              Сегодня день рождения — предложите десерт со свечой
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {birthdayPeople.map((g) => (
                <li key={g.id}>
                  {g.name ?? "Гость"} · <span className="font-mono">{g.phone}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">{guests.length} гостей в базе</CardTitle>
        </CardHeader>
        <CardContent>
          {guests.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Гости появятся автоматически после первых броней
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Гость</TableHead>
                  <TableHead>ДР</TableHead>
                  <TableHead>Теги</TableHead>
                  <TableHead>Последняя бронь</TableHead>
                  <TableHead className="w-14" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell>
                      <p className="font-medium">{g.name ?? "—"}</p>
                      <p className="font-mono text-xs text-muted-foreground">{g.phone}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {g.birthday
                        ? new Date(g.birthday).toLocaleDateString("ru-RU")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{g.tags ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-xs">
                      {g.bookings[0]
                        ? `${g.bookings[0].date} ${g.bookings[0].time}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <GuestEditDialog
                        guest={{
                          id: g.id,
                          name: g.name,
                          birthday: g.birthday
                            ? new Date(g.birthday).toISOString().slice(0, 10)
                            : null,
                          tags: g.tags,
                          notes: g.notes,
                        }}
                        action={updateGuest}
                      />
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
