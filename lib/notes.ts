import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/** Pages written by the engine land in content/notes/{slug}.md with front matter; drafts stay out. */
export interface Note {
  slug: string;
  title: string;
  description: string;
  date: string;
  body: string;
}

const DIR = path.join(process.cwd(), "content/notes");

function parse(file: string): Note | null {
  const raw = readFileSync(path.join(DIR, file), "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const fm: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    const v = line.slice(i + 1).trim();
    fm[line.slice(0, i).trim()] = v.startsWith('"') ? JSON.parse(v) : v;
  }
  if (fm.published === "false") return null;
  return {
    slug: fm.slug || file.replace(/\.md$/, ""),
    title: fm.title ?? "",
    description: fm.description ?? "",
    date: fm.date ?? "",
    body: m[2],
  };
}

export function allNotes(): Note[] {
  let files: string[] = [];
  try {
    files = readdirSync(DIR).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  return files.map(parse).filter((n): n is Note => n !== null);
}

export const noteBySlug = (slug: string) => allNotes().find((n) => n.slug === slug);
