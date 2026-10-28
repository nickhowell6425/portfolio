import { NextResponse, type NextRequest } from "next/server";
import { BRAND_PARAM, DEFAULT_BRAND, brandForHost, isBrandId } from "@/lib/brands";

/**
 * Host → brand. Each domain sees clean URLs (/paradox/overview); internally
 * the request is rewritten into app/[brand]/… so both brands prerender
 * statically. Hosts that don't name a brand (Vercel previews) fall back to
 * a ?brand= override, remembered in a cookie.
 */
export function proxy(req: NextRequest) {
  const url = req.nextUrl;

  const forced = url.searchParams.get(BRAND_PARAM);
  if (isBrandId(forced)) {
    const clean = url.clone();
    clean.searchParams.delete(BRAND_PARAM);
    const res = NextResponse.redirect(clean);
    res.cookies.set(BRAND_PARAM, forced, { path: "/", sameSite: "lax" });
    return res;
  }

  const cookie = req.cookies.get(BRAND_PARAM)?.value;
  const brand =
    brandForHost(req.headers.get("host")) ?? (isBrandId(cookie) ? cookie : DEFAULT_BRAND);

  const target = url.clone();
  if (url.pathname === "/favicon.ico") {
    target.pathname = `/brand/${brand}/favicon.ico`;
    return NextResponse.rewrite(target);
  }
  target.pathname = `/${brand}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(target);
}

export const config = {
  // Pages and the legacy favicon URL; other assets bypass brand routing.
  matcher: ["/favicon.ico", "/((?!api/|_next/|.*\\.[^/]+$).*)"],
};
