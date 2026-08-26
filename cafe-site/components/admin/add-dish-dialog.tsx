"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function AddDishDialog({
  categories,
  action,
}: {
  categories: { id: string; title: string }[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Добавить блюдо
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Новое блюдо</DialogTitle>
        </DialogHeader>
        <form
          action={async (fd) => {
            await action(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="nd-cat">Категория</Label>
            <Select name="categoryId" defaultValue={categories[0]?.id}>
              <SelectTrigger id="nd-cat" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="nd-title">Название</Label>
            <Input id="nd-title" name="title" required minLength={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nd-price">Цена, ₽</Label>
              <Input id="nd-price" name="price" type="number" min={0} required />
            </div>
            <div>
              <Label htmlFor="nd-weight">Вес / объём</Label>
              <Input id="nd-weight" name="weight" placeholder="250 г" />
            </div>
          </div>
          <div>
            <Label htmlFor="nd-desc">Описание</Label>
            <Textarea id="nd-desc" name="description" rows={2} />
          </div>
          <div>
            <Label htmlFor="nd-tags">Теги (HIT, VEG, SPICY)</Label>
            <Input id="nd-tags" name="tags" placeholder="HIT" />
          </div>
          <Button type="submit" className="w-full">
            Добавить
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
