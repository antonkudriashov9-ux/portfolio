import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Code2, MonitorPlay } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/fx/reveal";
import { getNextProject, getProject, projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline,
    openGraph: { title: project.title, description: project.tagline },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const next = getNextProject(project.slug);

  return (
    <article className="mx-auto max-w-6xl px-4 py-20 md:px-6">
      <Link
        href="/#projects"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        все проекты
      </Link>

      <header className="mt-8">
        <p className="font-mono text-xs tracking-[0.16em] text-primary">/{project.year}</p>
        <h1 className="mt-2 font-heading text-[clamp(2.25rem,7vw,5rem)] leading-none font-extrabold uppercase">
          {project.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{project.tagline}</p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.stack.map((tag) => (
            <Badge key={tag} variant="outline" className="font-mono text-[10px] uppercase">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={`/projects/${project.slug}/demo`}>
              <MonitorPlay />
              Живое демо
            </Link>
          </Button>
          {project.repoUrl ? (
            <Button asChild size="lg" variant="outline">
              <a href={project.repoUrl} target="_blank" rel="noreferrer">
                <Code2 />
                Исходный код
              </a>
            </Button>
          ) : null}
        </div>
      </header>

      <Reveal className="mt-12">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border">
          <Image
            src={project.screenshot}
            alt={`Скриншот проекта ${project.title}`}
            fill
            priority
            sizes="(max-width:1152px) 100vw, 1152px"
            className="object-cover"
          />
        </div>
      </Reveal>

      <div className="mt-14 grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {"// о проекте"}
          </h2>
          <p className="mt-4 leading-relaxed text-foreground/90">{project.description}</p>
        </section>

        <section>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {"// результаты"}
          </h2>
          <ul className="mt-4 space-y-3">
            {project.highlights.map((h) => (
              <li key={h} className="flex gap-2.5 text-sm text-muted-foreground">
                <span className="mt-0.5 text-primary" aria-hidden>
                  ▸
                </span>
                {h}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Link
        href={`/projects/${next.slug}`}
        data-cursor-label="Следующий"
        className="group mt-20 block rounded-2xl border p-6 transition-colors hover:border-primary/40 md:p-8"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          следующий проект
        </p>
        <p className="mt-2 flex items-center justify-between font-heading text-2xl font-bold uppercase md:text-3xl">
          {next.title}
          <ArrowRight className="size-6 transition-transform group-hover:translate-x-1.5" />
        </p>
      </Link>
    </article>
  );
}
