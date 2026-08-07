// Fixed-window in-memory rate limiter. Good enough for a single Railway
// instance; if this ever scales horizontally, swap the Map for Redis
// (INCR + EXPIRE) without changing the call sites below.

const buckets = new Map<string, { count: number; resetAt: number }>();

// Prevent unbounded growth from one-off keys (e.g. many distinct IPs).
const MAX_TRACKED_KEYS = 50_000;

export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
