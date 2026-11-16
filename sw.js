// Kettlebell Catalyst offline support: keep a copy of the app on the device.
// Pages load from the network when it's available (so updates arrive right away)
// and fall back to the saved copy when there's no signal.
const CACHE = "kbc-v1.8.7";
const FILES = ["./", "index.html", "manifest.json", "quotes.txt", "tips.txt", "icon-192.png", "icon-512.png", "icon-maskable-512.png",
               "apple-touch-icon.png", "favicon-32.png", "favicon-16.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
  );
});
