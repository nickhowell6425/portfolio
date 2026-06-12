import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ComponentCard } from "@/components/content/component-card";
import { LibraryGrid } from "@/components/content/library-grid";
import { OverviewHero } from "@/components/content/overview-hero";
import { PortraitHero } from "@/components/content/portrait-hero";
import { Sections } from "@/components/content/sections";
import { allSlugs, defaultItemId, hrefFor, resolveSlug, workspaceById } from "@/lib/navigation";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: [] as string[] }, ...allSlugs().map((slug) => ({ slug }))];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!slug || slug.length === 0) return {};
  const resolved = resolveSlug(slug);
  if (!resolved) return {};
  const title = `${resolved.item.label} — ${resolved.ws.name}`;
  const canonical = hrefFor(resolved.ws.id, resolved.itemId);
  return {
    title,
    description: resolved.item.desc,
    alternates: { canonical },
    openGraph: { title, description: resolved.item.desc, url: canonical },
  };
}

export default async function WorkspacePage({ params }: Props) {
  const { slug } = await params;

  // /paradox → /paradox/overview (and /home → /)
  if (slug?.length === 1) {
    const ws = workspaceById(slug[0]);
    if (!ws) notFound();
    redirect(hrefFor(ws.id, defaultItemId(ws)));
  }

  const resolved = resolveSlug(slug);
  if (!resolved) notFound();
  const { ws, itemId, item } = resolved;

  if (item.type === "library") return <LibraryGrid />;

  if (item.type === "comp") return <ComponentCard fid={item.frag} notes={item.paras} />;

  return (
    <>
      {item.hero ? <OverviewHero hero={item.hero} wsName={ws.name} /> : null}
      {ws.id === "home" && itemId === "about" ? <PortraitHero /> : null}
      <Sections sections={item.sections} accent={ws.accent} />
    </>
  );
}
