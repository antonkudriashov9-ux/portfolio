import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/fx/reveal";
import { SplitReveal } from "@/components/fx/split-reveal";
import { ParallaxImage } from "@/components/fx/parallax-image";

export interface SignatureDish {
  title: string;
  description: string | null;
  price: number;
  isHitOfWeek: boolean;
}

interface SignatureProps {
  dishes: SignatureDish[];
  photo: string;
}

export function SignatureDishes({ dishes, photo }: SignatureProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 md:px-8">
      <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            [фирменные блюда]
          </p>
          <SplitReveal
            text="То, что заказывают снова"
            className="mt-4 font-heading text-[clamp(2rem,4.5vw,3.5rem)] leading-tight"
          />

          <ul className="mt-12">
            {dishes.map((dish, i) => (
              <Reveal key={dish.title} delay={i * 0.07}>
                <li className="group border-b border-border py-5">
                  <div className="flex items-baseline gap-4">
                    <h3 className="font-heading text-xl transition-colors group-hover:text-primary md:text-2xl">
                      {dish.title}
                    </h3>
                    <span className="mx-1 flex-1 border-b border-dotted border-border/80" aria-hidden />
                    <p className="shrink-0 font-mono text-lg text-primary">{dish.price} ₽</p>
                  </div>
                  {dish.description ? (
                    <p className="mt-1.5 max-w-lg text-sm text-muted-foreground">
                      {dish.description}
                    </p>
                  ) : null}
                  {dish.isHitOfWeek ? (
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-olive">
                      ★ хит недели
                    </p>
                  ) : null}
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.3}>
            <Link
              href="/menu"
              className="mt-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:text-foreground"
            >
              Всё меню — 70+ позиций
              <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>

        <div className="relative hidden lg:block">
          <ParallaxImage
            src={photo}
            alt="Атмосфера ресторана"
            className="aspect-[3/4] rounded-3xl"
            intensity={0.16}
          />
          <Reveal
            delay={0.25}
            className="absolute -bottom-8 -left-10 w-56 overflow-hidden rounded-2xl border border-border shadow-2xl shadow-black/40"
          >
            <ParallaxImage
              src="/media/photos/photo-004.jpg"
              alt="Деталь интерьера"
              className="aspect-[4/3]"
              intensity={0.08}
              sizes="240px"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
