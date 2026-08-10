import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "truenorth_session";
const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/api/stripe/webhook",
  "/api/cron",
  "/api/preorder",
];
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Defense in depth against CSRF: the session cookie is SameSite=Lax and
// every mutating route only accepts application/json (which forces a CORS
// preflight our server never approves for foreign origins), but checking
// Origin here costs nothing and doesn't rely on either of those holding.
//
// Compare against the Host the client actually connected to, not
// request.nextUrl.host — behind a reverse proxy (Railway, and virtually
// every PaaS) that can reflect an internal hostname instead of the public
// domain, which false-positives every request. X-Forwarded-Host is the
// standard header proxies set for exactly this.
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set. Add it to your .env file.");
  }
  return new TextEncoder().encode(secret);
}

async function hasValidSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/") && MUTATING_METHODS.has(request.method) && !isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }

  const isPublicPath = pathname === "/" || PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const signedIn = await hasValidSession(request);

  if (!signedIn && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (signedIn && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|icon.svg|apple-icon.png|manifest.webmanifest|icon-192.png|icon-512.png|icon-maskable-512.png).*)",
  ],
};
