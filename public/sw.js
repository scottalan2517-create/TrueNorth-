// Minimal service worker — exists solely to satisfy Chrome's installability
// criteria (a registered SW with a fetch handler) so `beforeinstallprompt`
// fires. Deliberately does no caching: every request passes straight
// through to the network. Do not add caching here without first thinking
// through how it interacts with authenticated API responses.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // No-op: letting the browser handle every request normally is what
  // keeps this safe. Presence of the handler is what Chrome checks for.
});
