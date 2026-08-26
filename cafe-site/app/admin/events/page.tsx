import { db } from "@/lib/db";
import { setEventStatus } from "@/app/admin/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AutoSubmitForm } from "@/components/admin/auto-submit-form";

const LABEL: Record<string, string> = {
  NEW: "новая",
  IN_PROGRESS: "в работе",
  DONE: "проведено",
  DECLINED: "отказ",
};

const STATUSES = ["NEW", "IN_PROGRESS", "DONE", "DECLINED"] as const;

export default async function AdminEvents() {
  const requests = await db.eventRequest.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl">Банкеты и события</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">{requests.length} заявок</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Заявок пока нет — форма на странице /events складывает их сюда
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {requests.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {r.eventType} · {r.name}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">{r.phone}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {r.guestsCount ? `Гостей: ${r.guestsCount}. ` : ""}
                      {r.date ? `Дата: ${r.date}. ` : ""}
                      {r.comment ?? ""}
                    </p>
                  </div>
                  <AutoSubmitForm action={setEventStatus} className="w-44">
                    <input type="hidden" name="id" value={r.id} />
                    <Select name="status" defaultValue={r.status}>
                      <SelectTrigger aria-label="Статус заявки">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {LABEL[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AutoSubmitForm>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
