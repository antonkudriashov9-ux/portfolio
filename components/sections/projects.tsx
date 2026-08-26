"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Code2, MonitorPlay } from "lucide-react";
import { SectionHeading } from "@/components/fx/section-heading";
import { Reveal } from "@/components/fx/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { projects, type Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Reveal
      delay={index * 0.08}
      className={cn(project.featured && "md:col-span-2")}
    >
      <article
        data-cursor-label="Открыть"
        className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-black/10"
      >
        <Link
          href={`/projects/${project.slug}`}
          className="relative block aspect-[16/10] overflow-hidden border-b border-border"
          aria-label={`${project.title} — подробнее`}
        >
          <Image
            src={project.screenshot}
            alt={`Скриншот проекта ${project.title}`}
            fill
            sizes={project.featured ? "(max-width:768px) 100vw, 66vw" : "(max-width:768px) 100vw, 33vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <span className="absolute inset-x-0 bottom-0 translate-y-full bg-background/85 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
            смотреть кейс →
          </span>
        </Link>

        <div className="flex grow flex-col gap-3 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-heading text-xl font-bold">{project.title}</h3>
            <span className="font-mono text-xs text-muted-foreground">/{project.year}</span>
          </div>

          <p className="text-sm text-muted-foreground">{project.tagline}</p>

          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {project.stack.map((tag) => (
              <Badge key={tag} variant="outline" className="font-mono text-[10px] uppercase">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button asChild size="sm">
              <Link href={`/projects/${project.slug}/demo`}>
                <MonitorPlay />
                Живое демо
              </Link>
            </Button>
            {project.repoUrl ? (
              <Button asChild size="sm" variant="ghost">
                <a href={project.repoUrl} target="_blank" rel="noreferrer">
                  <Code2 />
                  Код
                  <ArrowUpRight />
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export function Projects() {
  return (
    <section id="projects" className="scroll-mt-24 bg-blueprint">
      <div className="mx-auto max-w-6xl px-4 py-24 md:px-6">
        <SectionHeading
          index="02"
          label="проекты"
          title="Избранные работы"
          description="Каждый проект открывается в режиме живого демо прямо на сайте — без перезапусков и заглушек."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
