// Keeps the app working offline. Bump VERSION whenever you upload new files.
const VERSION = "stl-v4";
const SHELL = ["./", "index.html", "manifest.webmanifest", "privacy.html",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))));
  self.clients.claim();
});

const keep = (req, res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; };

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;                        // AI questions are never cached
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (req.mode === "navigate") {                         // newest page when online, saved copy offline
      e.respondWith(fetch(req).then((r) => keep("index.html", r)).catch(() => caches.match("index.html")));
    } else {
      e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => keep(req, r))));
    }
  } else if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => keep(req, r))));
  }
});
