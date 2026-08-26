import type { Metadata } from "next";
import { db } from "@/lib/db";
import { SplitReveal } from "@/components/fx/split-reveal";
import { BookingFlow } from "@/components/booking/booking-flow";

export const metadata: Metadata = {
  title: "Бронирование",
};

export default async function BookingPage() {
  const locations = await db.location.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="mx-auto min-h-svh max-w-4xl px-4 pb-28 pt-36 md:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
        [бронирование]
      </p>
      <SplitReveal
        as="h1"
        text="Ваш столик"
        className="mt-4 font-heading text-[clamp(2.6rem,7vw,5rem)]"
      />
      <p className="mt-5 max-w-lg text-muted-foreground">
        Три шага — и столик закреплён за вами. Менеджер перезвонит для подтверждения.
      </p>

      <div className="mt-12">
        <BookingFlow
          locations={locations.map((l) => ({
            slug: l.slug,
            name: l.name,
            address: l.address,
            hours: l.hours,
          }))}
        />
      </div>
    </div>
  );
}
