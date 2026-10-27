import type { BrandId } from "./brands";
import {
  workspacesFor,
  type CompItem,
  type DemoItem,
  type LibraryItem,
  type PageItem,
  type Workspace,
} from "./content";

export type RoutableItem = PageItem | CompItem | DemoItem | LibraryItem;

export interface Resolved {
  ws: Workspace;
  itemId: string;
  item: RoutableItem;
}

export function defaultItemId(ws: Workspace): string {
  return ws.groups[0].items[0];
}

/** Canonical href for a workspace item. Home/About is the site root. */
export function hrefFor(wsId: string, itemId: string): string {
  if (wsId === "home" && itemId === "about") return "/";
  return `/${wsId}/${itemId}`;
}

export interface SearchEntry {
  icon: string;
  label: string;
  sub: string;
  ws: string;
  ch: string;
}

/** Route/search resolution over one brand's workspaces. */
export interface Nav {
  workspaces: Workspace[];
  workspaceById: (id: string) => Workspace | undefined;
  /** Resolve an optional catch-all slug to a workspace item, or null. */
  resolveSlug: (slug?: string[]) => Resolved | null;
  /** Resolve a pathname (e.g. "/paradox/overview") on the client. */
  resolvePathname: (pathname: string) => Resolved | null;
  /** Every routable [ws, item] pair, for generateStaticParams. */
  allSlugs: () => string[][];
  /** Jump-to index: every page and component across all workspaces. */
  searchItems: () => SearchEntry[];
  searchResults: (query: string) => SearchEntry[];
}

function buildNav(brand: BrandId): Nav {
  const workspaces = workspacesFor(brand);

  const workspaceById = (id: string) => workspaces.find((w) => w.id === id);

  const resolveSlug = (slug?: string[]): Resolved | null => {
    const path = !slug || slug.length === 0 ? ["home", "about"] : slug;
    if (path.length > 2) return null;
    const ws = workspaceById(path[0]);
    if (!ws) return null;
    const itemId = path[1] ?? defaultItemId(ws);
    const item = ws.items[itemId];
    if (!item || item.type === "ws") return null;
    return { ws, itemId, item };
  };

  // During prerender usePathname() sees the proxy's internal path
  // (/fst/paradox/overview); in the browser it sees the visible one.
  // Strip the brand segment so both resolve the same item.
  const resolvePathname = (pathname: string) => {
    const slug = pathname.split("/").filter(Boolean).map(decodeURIComponent);
    return resolveSlug(slug[0] === brand ? slug.slice(1) : slug);
  };

  const allSlugs = () => {
    const out: string[][] = [];
    for (const ws of workspaces) {
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
  };

  let searchIndex: SearchEntry[] | null = null;
  const searchItems = () => {
    if (searchIndex) return searchIndex;
    const out: SearchEntry[] = [];
    for (const w of workspaces) {
      for (const g of w.groups) {
        for (const id of g.items) {
          const it = w.items[id];
          if (it.type === "ws") continue;
          if (it.type === "library" && w.id !== "home") continue;
          out.push({
            icon: it.type === "page" ? "#" : it.type === "demo" ? "▶" : "▣",
            label: it.label,
            sub:
              it.type === "comp"
                ? `${w.name} · live component`
                : it.type === "demo"
                  ? `${w.name} · interactive demo`
                  : w.name,
            ws: w.id,
            ch: id,
          });
        }
      }
    }
    searchIndex = out;
    return out;
  };

  const searchResults = (query: string) => {
    const q = query.toLowerCase().trim();
    const all = searchItems();
    return (q ? all.filter((i) => `${i.label} ${i.sub}`.toLowerCase().includes(q)) : all).slice(
      0,
      9,
    );
  };

  return {
    workspaces,
    workspaceById,
    resolveSlug,
    resolvePathname,
    allSlugs,
    searchItems,
    searchResults,
  };
}

const navs = new Map<BrandId, Nav>();

export function navFor(brand: BrandId): Nav {
  let nav = navs.get(brand);
  if (!nav) {
    nav = buildNav(brand);
    navs.set(brand, nav);
  }
  return nav;
}
