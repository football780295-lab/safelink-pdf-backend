const CACHE_NAME = "pdf-tools-v1";
const STATIC_ASSETS = [
  "/",
  "/en",
  "/bn",
  "/logo.svg",
  "/icon.svg",
  "/manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only cache GET requests that are not API calls
  if (event.request.method === "GET" && !event.request.url.includes("/api/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).catch(() => {
            // Return cached root if navigation fails
            if (event.request.mode === "navigate") {
              return caches.match("/en");
            }
          })
        );
      })
    );
  }
});
