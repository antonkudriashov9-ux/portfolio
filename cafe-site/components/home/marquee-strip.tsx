const ITEMS = ["паста", "пицца из печи", "стейки", "том ям", "завтраки с 8:00", "коктейли", "десерты", "морепродукты"];

export function MarqueeStrip() {
  return (
    <section
      aria-hidden
      className="marquee-paused overflow-hidden border-y border-border bg-card/40 py-5"
    >
      <div className="animate-marquee flex w-max [--marquee-duration:42s]">
        {[0, 1].map((half) => (
          <ul key={half} className="flex shrink-0 items-center">
            {ITEMS.map((item) => (
              <li
                key={`${half}-${item}`}
                className="flex items-center gap-8 px-8 font-heading text-xl text-foreground/70 md:text-2xl"
              >
                {item}
                <span className="font-mono text-sm text-primary">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
