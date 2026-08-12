import type { NextConfig } from "next";

// Everything this app loads is same-origin or a full navigation (Stripe
// Checkout redirect), not an embed — with one deliberate exception: Plaid
// Link (optional bank sync, opt-in Plus perk) runs in an embedded iframe
// from cdn.plaid.com, per Plaid's documented CSP requirements
// (https://plaid.com/docs/link/web/#link-web-integration-content-security-policy).
//
// This is otherwise Next's own documented "without nonces" CSP baseline
// (see node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md).
// A nonce-based script-src is stricter, but it requires forcing *every*
// route into dynamic rendering — Next's own inline hydration scripts get
// baked into static HTML at build time with no way to match a per-request
// nonce, so login/signup/onboarding would break or need `await connection()`
// sprinkled in. 'unsafe-inline' on script-src is the tradeoff Next
// recommends for apps that don't need that. It doesn't weaken us much in
// practice: this app has zero dangerouslySetInnerHTML, so there's no route
// for injected markup to become an inline <script> in the first place.
const isDev = process.env.NODE_ENV === "development";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://cdn.plaid.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://production.plaid.com https://sandbox.plaid.com",
  "frame-src https://cdn.plaid.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
