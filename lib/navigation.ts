import {
  WORKSPACES,
  type CompItem,
  type LibraryItem,
  type PageItem,
  type Workspace,
} from "./content";

export type RoutableItem = PageItem | CompItem | LibraryItem;

export interface Resolved {
  ws: Workspace;
  itemId: string;
  item: RoutableItem;
}

export function workspaceById(id: string): Workspace | undefined {
  return WORKSPACES.find((w) => w.id === id);
}

export function defaultItemId(ws: Workspace): string {
  return ws.groups[0].items[0];
}

/** Canonical href for a workspace item. Home/About is the site root. */
export function hrefFor(wsId: string, itemId: string): string {
  if (wsId === "home" && itemId === "about") return "/";
  return `/${wsId}/${itemId}`;
}

/** Resolve an optional catch-all slug to a workspace item, or null. */
export function resolveSlug(slug?: string[]): Resolved | null {
  const path = !slug || slug.length === 0 ? ["home", "about"] : slug;
  if (path.length > 2) return null;
  const ws = workspaceById(path[0]);
  if (!ws) return null;
  const itemId = path[1] ?? defaultItemId(ws);
  const item = ws.items[itemId];
  if (!item || item.type === "ws") return null;
  return { ws, itemId, item };
}

/** Resolve a pathname (e.g. "/paradox/overview") on the client. */
export function resolvePathname(pathname: string): Resolved | null {
  const slug = pathname.split("/").filter(Boolean).map(decodeURIComponent);
  return resolveSlug(slug);
}

/** Every routable [ws, item] pair, for generateStaticParams. */
export function allSlugs(): string[][] {
  const out: string[][] = [];
  for (const ws of WORKSPACES) {
    out.push([ws.id]);
    for (const g of ws.groups) {
      for (const id of g.items) {
        const item = ws.items[id];
        if (item.type === "ws") continue;
        out.push([ws.id, id]);
      }
    }
  }
  return out;
}

export interface SearchEntry {
  icon: string;
  label: string;
  sub: string;
  ws: string;
  ch: string;
}

let searchIndex: SearchEntry[] | null = null;

/** Jump-to index: every page and component across all workspaces. */
export function searchItems(): SearchEntry[] {
  if (searchIndex) return searchIndex;
  const out: SearchEntry[] = [];
  for (const w of WORKSPACES) {
    for (const g of w.groups) {
      for (const id of g.items) {
        const it = w.items[id];
        if (it.type === "ws") continue;
        if (it.type === "library" && w.id !== "home") continue;
        out.push({
          icon: it.type === "page" ? "#" : "▣",
          label: it.label,
          sub: it.type === "comp" ? `${w.name} · live component` : w.name,
          ws: w.id,
          ch: id,
        });
      }
    }
  }
  searchIndex = out;
  return out;
}

export function searchResults(query: string): SearchEntry[] {
  const q = query.toLowerCase().trim();
  const all = searchItems();
  return (q ? all.filter((i) => `${i.label} ${i.sub}`.toLowerCase().includes(q)) : all).slice(0, 9);
}
