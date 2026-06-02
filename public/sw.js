/* eslint-disable no-restricted-globals */
// Minimal SW for prototype. For production, prefer Workbox-based strategy.

const CACHE_NAME = "bengala-pwa-v1";
const PRECACHE_URLS = ["/", "/offline", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// Network-first for navigations; cache-first for same-origin assets.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  const isNavigation =
    request.mode === "navigate" ||
    (request.destination === "" &&
      request.headers.get("accept")?.includes("text/html"));

  if (isNavigation) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
          return response;
        } catch {
          const cache = await caches.open(CACHE_NAME);
          return (
            (await cache.match(request)) ||
            (await cache.match("/offline")) ||
            new Response("Offline", { status: 503 })
          );
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;

      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    })()
  );
});

