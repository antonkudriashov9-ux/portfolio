"use client";

import { motion } from "motion/react";

interface SplitRevealProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "p";
}

/** Пословное появление заголовка снизу вверх с лёгким поворотом. */
export function SplitReveal({
  text,
  className,
  delay = 0,
  stagger = 0.05,
  as = "h2",
}: SplitRevealProps) {
  const words = text.split(" ");
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={`${i}-${word}`} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
          <motion.span
            className="inline-block will-change-transform"
            variants={{
              hidden: { y: "110%", rotate: 4 },
              visible: {
                y: "0%",
                rotate: 0,
                transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
