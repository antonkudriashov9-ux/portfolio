"use client";

import { Reveal } from "@/components/fx/reveal";
import { ScrambleText } from "@/components/fx/scramble-text";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  index: string;
  label: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeading({
  index,
  label,
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-12 md:mb-16", className)}>
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          [{index}]{" "}
          <span className="text-primary">{"//"}</span> {label}
        </p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="mt-3 font-heading text-[clamp(2rem,5vw,3.75rem)] leading-tight font-bold uppercase">
          <ScrambleText text={title} />
        </h2>
      </Reveal>
      {description ? (
        <Reveal delay={0.16}>
          <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            {description}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
