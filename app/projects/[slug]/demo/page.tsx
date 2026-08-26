import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/lib/projects";
import { DemoBrowser } from "@/components/projects/demo-browser";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]/demo">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  return { title: project ? `${project.title} — живое демо` : "Живое демо" };
}

export default async function DemoPage({
  params,
}: PageProps<"/projects/[slug]/demo">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <DemoBrowser project={project} />;
}
