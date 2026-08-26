"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface GuestEditValues {
  id: string;
  name: string | null;
  birthday: string | null; // YYYY-MM-DD
  tags: string | null;
  notes: string | null;
}

export function GuestEditDialog({
  guest,
  action,
}: {
  guest: GuestEditValues;
  action: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Редактировать ${guest.name ?? "гостя"}`}>
          <Pencil className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Гость · {guest.name ?? guest.id}</DialogTitle>
        </DialogHeader>
        <form
          action={async (fd) => {
            await action(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={guest.id} />
          <div>
            <Label htmlFor="g-name">Имя</Label>
            <Input id="g-name" name="name" defaultValue={guest.name ?? ""} />
          </div>
          <div>
            <Label htmlFor="g-birthday">День рождения (для десерта со свечой)</Label>
            <Input id="g-birthday" name="birthday" type="date" defaultValue={guest.birthday ?? ""} />
          </div>
          <div>
            <Label htmlFor="g-tags">Теги (через запятую)</Label>
            <Input id="g-tags" name="tags" defaultValue={guest.tags ?? ""} placeholder="VIP, аллергия: орехи" />
          </div>
          <div>
            <Label htmlFor="g-notes">Заметки</Label>
            <Input id="g-notes" name="notes" defaultValue={guest.notes ?? ""} />
          </div>
          <Button type="submit" className="w-full">
            Сохранить
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
