const TECH = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "NestJS",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "GraphQL",
  "WebSocket",
  "TailwindCSS",
  "CI/CD",
  "Vercel",
];

export function Marquee() {
  return (
    <section
      aria-hidden
      className="marquee-paused overflow-hidden border-y border-border bg-card/40 py-4"
    >
      <div className="animate-marquee flex w-max">
        {[0, 1].map((half) => (
          <ul key={half} className="flex shrink-0 items-center">
            {TECH.map((t) => (
              <li
                key={`${half}-${t}`}
                className="flex items-center gap-8 px-8 font-mono text-sm tracking-[0.18em] text-muted-foreground uppercase"
              >
                {t}
                <span className="text-primary">{"//"}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
