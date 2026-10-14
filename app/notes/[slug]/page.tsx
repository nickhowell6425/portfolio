import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { markdownToHtml } from "@/lib/markdown";
import { allNotes, noteBySlug } from "@/lib/notes";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return allNotes().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = noteBySlug((await params).slug);
  if (!note) return {};
  const canonical = `/notes/${note.slug}`;
  return {
    title: note.title,
    description: note.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: note.title,
      description: note.description,
      url: canonical,
    },
  };
}

export default async function NotePage({ params }: Props) {
  const note = noteBySlug((await params).slug);
  if (!note) notFound();
  return (
    <article className="note anim-item">
      <h1>{note.title}</h1>
      {/* markdownToHtml escapes the text before adding markup */}
      <div dangerouslySetInnerHTML={{ __html: markdownToHtml(note.body) }} />
    </article>
  );
}
