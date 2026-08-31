/**
 * NutriVision AI — service worker
 *
 * Strategy:
 *   navigation   → network first, cache fallback, then offline page
 *   static assets→ stale-while-revalidate (fast, self-healing)
 *   /api/*       → network only, never cached (nutrition analysis must be live)
 *
 * Bump CACHE_VERSION on release to retire old caches.
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `nutrivision-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `nutrivision-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

const PRECACHE = [
  "/",
  "/index.html",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      // addAll fails the whole install if any single item 404s, so add
      // individually and tolerate misses.
      .then((cache) =>
        Promise.all(
          PRECACHE.map((url) =>
            cache.add(url).catch((err) => console.warn("[sw] precache skipped:", url, err))
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  // Lets the page trigger an immediate update when the user taps "Reload".
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never cache the analysis endpoint — a stale nutrition result is worse
  // than an honest failure.
  if (url.pathname.startsWith("/api/")) return;

  // Skip cross-origin requests entirely.
  if (url.origin !== self.location.origin) return;

  // Navigations: network first so users get fresh code, cache as backup.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const shell = await caches.match("/index.html");
          if (shell) return shell;
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Static assets: serve from cache immediately, refresh in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
