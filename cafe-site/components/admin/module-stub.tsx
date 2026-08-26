import { Hammer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ModuleStub({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl">{title}</h1>
      </div>
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium text-muted-foreground">
            <Hammer className="size-4" />
            Модуль в разработке
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
