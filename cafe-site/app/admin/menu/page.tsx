import { Star, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import {
  addDish,
  deleteDish,
  setDishPrice,
  setHitOfWeek,
  toggleDishAvailable,
} from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AutoSubmitForm } from "@/components/admin/auto-submit-form";
import { AddDishDialog } from "@/components/admin/add-dish-dialog";

export default async function AdminMenu() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { dishes: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-3xl">Меню</h1>
        <AddDishDialog
          categories={categories.map((c) => ({ id: c.id, title: c.title }))}
          action={addDish}
        />
      </div>

      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-xl">
              {category.title}{" "}
              <span className="font-sans text-sm font-normal text-muted-foreground">
                · {category.dishes.length} позиций
              </span>
            </CardTitle>
          </CardHeader>          <CardContent>
            <ul className="divide-y divide-border">
              {category.dishes.map((dish) => (
                <li key={dish.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {dish.title}
                      {dish.isHitOfWeek ? (
                        <Badge className="ml-2" variant="default">
                          ★ хит недели
                        </Badge>
                      ) : null}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {dish.weight ?? "—"}
                      {dish.tags ? ` · ${dish.tags}` : ""}
                    </p>
                  </div>

                  {/* Цена */}
                  <form action={setDishPrice} className="flex items-center gap-1.5">
                    <input type="hidden" name="id" value={dish.id} />
                    <Input
                      name="price"
                      type="number"
                      defaultValue={dish.price}
                      className="h-8 w-24 font-mono"
                      aria-label={`Цена: ${dish.title}`}
                    />
                    <Button type="submit" variant="outline" size="sm">
                      ₽
                    </Button>
                  </form>

                  {/* В наличии */}
                  <AutoSubmitForm action={toggleDishAvailable} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={dish.id} />
                    <input type="hidden" name="available" value={dish.available ? "false" : "true"} />
                    <Switch checked={dish.available} aria-label={`В наличии: ${dish.title}`} />
                  </AutoSubmitForm>

                  {/* Хит недели */}
                  <form action={setHitOfWeek}>
                    <input type="hidden" name="id" value={dish.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Сделать хитом недели: ${dish.title}`}
                      disabled={dish.isHitOfWeek}
                    >
                      <Star className={dish.isHitOfWeek ? "size-4 fill-primary text-primary" : "size-4"} />
                    </Button>
                  </form>

                  {/* Удалить */}
                  <form action={deleteDish}>
                    <input type="hidden" name="id" value={dish.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Удалить: ${dish.title}`}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

