import assert from "node:assert/strict";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

// Run against `pnpm start` (or a dev server) to check the content people and crawlers receive.
const base = process.env.CONTENT_CHECK_URL ?? "http://localhost:3000";
// Node's fetch can ignore Host overrides; use HTTP directly to exercise host routing.
const request = (path, host) =>
  new Promise((resolve, reject) => {
    const url = new URL(path, base);
    const send = url.protocol === "https:" ? httpsRequest : httpRequest;
    const req = send(url, { headers: { Host: host } }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("error", reject);
      res.on("end", () =>
        resolve(new Response(body, { status: res.statusCode, headers: res.headers })),
      );
    });
    req.on("error", reject);
    req.setTimeout(15000, () => req.destroy(new Error(`Timed out: ${path}`)));
    req.end();
  });
const read = async (path, host) => {
  const response = await request(path, host);
  assert.equal(response.status, 200, `${host}${path}: HTTP ${response.status}`);
  return response.text();
};
const canonical = (html) => html.match(/rel="canonical" href="([^"]+)"/)?.[1];
const schema = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(
    (match) => {
      const data = JSON.parse(match[1]);
      return data["@graph"] ?? [data];
    },
  );
const paths = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const personalHost = new URL(base).host;
const fstHost = "fst.localhost:3000";
const fstSitemap = paths(await read("/sitemap.xml", fstHost));
const studioPaths = fstSitemap.filter((path) =>
  ["/blog", "/services", "/ai", "/prompts"].some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  ),
);
assert(
  studioPaths.includes("/blog"),
  "The canonical blog index must be discoverable in the sitemap",
);
assert(
  studioPaths.some((path) => path.startsWith("/blog/")),
  "The sitemap must expose blog articles",
);
assert(
  studioPaths.includes("/ai") && studioPaths.includes("/prompts"),
  "AI and prompt hubs must be discoverable",
);
const fstHome = canonical(await read("/", fstHost));
assert(fstHome, "FST home needs a canonical URL");

let checked = 0;
for (const host of [personalHost, fstHost]) {
  const sitemap = paths(await read("/sitemap.xml", host));
  assert.equal(new Set(sitemap).size, sitemap.length, "Sitemap URLs must be unique");
  assert(!sitemap.includes("/home/about"), "The sitemap must use the canonical homepage");
  assert(
    !sitemap.some((path) => path.endsWith("/demo")),
    "Demo wrappers must not be in the sitemap",
  );
  if (host === personalHost) {
    assert(
      !sitemap.some((path) => studioPaths.includes(path)),
      "Studio resources must not appear in the personal sitemap",
    );
  }
  const home = await read("/", host);
  for (const label of ["S — Services", "B — Blog", "AI — AI playbook", "PR — Prompt library"]) {
    assert(!home.includes(`aria-label="${label}"`), `The project rail must not contain ${label}`);
  }
  assert(
    home.includes('aria-label="HM — Helm"'),
    "The project rail must preserve the Helm workspace",
  );
  if (host === fstHost) {
    for (const path of ["/blog", "/ai", "/prompts", "/services/product-development"])
      assert(home.includes(`href="${path}"`), `FST home must expose ${path}`);
  }
  const homeTwitterTitle = home.match(/name="twitter:title" content="([^"]+)"/)?.[1];
  const routes = new Set(sitemap);
  const links = new Set();
  for (const path of routes) {
    const html = await read(path, host);
    assert.equal(
      [...html.matchAll(/<h1\b/g)].length,
      1,
      `${host}${path}: one visible primary heading`,
    );
    assert(html.match(/<meta name="description" content="[^"]+"/), `${path}: missing description`);
    assert(html.match(/property="og:title" content="[^"]+"/), `${path}: missing Open Graph title`);
    assert(html.match(/name="twitter:title" content="[^"]+"/), `${path}: missing Twitter title`);
    if (path !== "/") {
      const twitterTitle = html.match(/name="twitter:title" content="([^"]+)"/)?.[1];
      assert.notEqual(
        twitterTitle,
        homeTwitterTitle,
        `${path}: social metadata must describe this page`,
      );
    }
    const url = canonical(html);
    assert(url, `${path}: missing canonical`);
    assert.equal(new URL(url).pathname, path, `${path}: wrong canonical path`);
    if (studioPaths.includes(path)) {
      assert.equal(
        new URL(url).origin,
        new URL(fstHome).origin,
        `${path}: studio page must use its own domain`,
      );
    }
    const entities = schema(html);
    assert(entities.length, `${path}: missing structured data`);
    if (path.startsWith("/blog/")) {
      const article = entities.find((entity) => entity["@type"] === "BlogPosting");
      assert(
        article?.author?.name && article?.datePublished,
        `${path}: article needs author and date`,
      );
      assert.equal(article.mainEntityOfPage, url, `${path}: schema and canonical must agree`);
      assert(
        html.includes(`dateTime="${article.datePublished}"`),
        `${path}: publication date must be visible`,
      );
    }
    if (path.startsWith("/prompts/")) {
      const templates = [...html.matchAll(/<pre\b[^>]*>([\s\S]*?)<\/pre>/g)];
      assert(
        templates.length > 0,
        `${path}: prompt text must be available in server-rendered HTML`,
      );
      assert(
        html.includes("Use when:") && html.includes("Bring:") && html.includes("Check:"),
        `${path}: explain timing, context, and verification`,
      );
      for (const template of templates)
        assert(template[1].includes("["), `${path}: template needs context fields to replace`);
    }
    if (["/ai/models", "/ai/workflow", "/ai/lean-team"].includes(path)) {
      assert(
        html.includes("<table") && html.includes('scope="col"') && html.includes('scope="row"'),
        `${path}: comparison needs accessible table headers`,
      );
    }
    for (const match of html.matchAll(/href="(\/[^"#?]*)/g)) {
      if (!match[1].includes(".") && !match[1].startsWith("//")) links.add(match[1]);
    }
    checked++;
  }
  for (const path of links) await read(path, host);
  const aliases = [["/home/about", "/"]];
  if (host === fstHost)
    aliases.push(["/blog/index", "/blog"], ["/ai/index", "/ai"], ["/prompts/index", "/prompts"]);
  for (const [alias, target] of aliases) {
    const response = await request(alias, host);
    assert([307, 308].includes(response.status), `${alias}: expected redirect`);
    assert.equal(new URL(response.headers.get("location"), base).pathname, target);
  }
  if (host === personalHost) {
    const movedPaths = [...studioPaths, "/services", "/blog/index", "/ai/index", "/prompts/index"];
    for (const path of movedPaths) {
      const response = await request(path, host);
      assert.equal(
        response.status,
        308,
        `${path}: former personal resources need a permanent redirect`,
      );
      const location = new URL(response.headers.get("location"));
      assert.equal(
        location.origin,
        new URL(fstHome).origin,
        `${path}: redirect to the studio domain`,
      );
      const expected =
        path === "/services" ? "/services/product-development" : path.replace(/\/index$/, "");
      assert.equal(
        location.pathname,
        expected,
        `${path}: redirect directly to the canonical destination`,
      );
    }
    for (const path of [
      "/ai/does-not-exist",
      "/blog/does-not-exist",
      "/services/does-not-exist",
      "/prompts/does-not-exist",
    ]) {
      assert.equal(
        (await request(path, host)).status,
        404,
        `${path}: do not redirect unknown routes`,
      );
    }
    assert(
      !home.includes('aria-label="AI — AI playbook"'),
      "Personal navigation should not include studio workspaces",
    );
    assert(
      !home.includes('href="/ai"') && !home.includes('href="/blog"'),
      "Personal pages should link directly to FST resources",
    );
    assert(
      home.includes(new URL("/ai/workflow", fstHome).href),
      "Personal home needs selected studio writing",
    );
  }
  const demo = await read("/paradox/demo", host);
  assert(demo.includes('name="robots" content="noindex'), "Demo wrapper must be noindex");
}
for (const product of ["paradox", "timetrack", "constellation", "helm", "nemo"]) {
  const path = `/${product}/overview`;
  const personal = await read(path, personalHost);
  const studio = await read(path, fstHost);
  assert(
    personal.includes("My contribution and decisions"),
    `${path}: personal page should explain Nicholas's contribution`,
  );
  assert(
    studio.includes("The problem this approach addresses"),
    `${path}: studio page should explain client relevance`,
  );
  const description = (html) => html.match(/name="description" content="([^"]+)"/)?.[1];
  assert.notEqual(
    description(personal),
    description(studio),
    `${path}: brands should have distinct descriptions`,
  );
}
const rawDemo = await request("/demos/paradox/02-Marketing/Homepage.html", personalHost);
assert.equal(rawDemo.headers.get("x-robots-tag"), "noindex", "Raw demos must be noindex");
const preview = await request("/", "preview.example");
assert.equal(preview.headers.get("x-robots-tag"), "noindex", "Preview pages must be noindex");
console.log(
  `Content checks passed: ${checked} pages across both brands, internal links, article schema, canonicals, sitemaps, and indexing rules.`,
);
