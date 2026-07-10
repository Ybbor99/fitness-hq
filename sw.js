const CACHE = "fitness-hq-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./tailwind.css",
  "./react.production.min.js",
  "./react-dom.production.min.js",
  "./app.js",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request)
          .then((resp) => {
            if (resp.ok && new URL(e.request.url).origin === self.location.origin) {
              const copy = resp.clone();
              caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
            }
            return resp;
          })
          .catch(() => {
            if (e.request.mode === "navigate") return caches.match("./index.html");
            throw new Error("offline");
          })
    )
  );
});
