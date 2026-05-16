/* Astarter — service worker v3.1
 *
 * Aggressive caching strategy for instant repeat visits + offline support:
 *   - Install:    pre-fetches the full critical shell (HTML/CSS/JS/poster/logo)
 *   - HTML:       network-first (so deployments are live immediately)
 *   - Images:     CACHE-FIRST (never refetch — they're versioned by filename)
 *   - JS/CSS:     stale-while-revalidate with ignoreSearch (versioned URLs
 *                 like /js/app.js?v=3.1 match the unversioned precache entry)
 *   - Cross-origin: pass-through (don't cache Spline/jsDelivr — they have own CDN)
 *
 * Bump VERSION when you ship updates to bust the old cache. The SW will
 * auto-delete stale caches on activate.
 */

const VERSION = "astarter-v4.7";
const SHELL = `${VERSION}-shell`;   /* HTML, manifest, sw self */
const STATIC = `${VERSION}-static`; /* JS, CSS */
const MEDIA  = `${VERSION}-media`;  /* images, video, svg, fonts, 3D */

/* Critical path — fetched at install time so repeat visits are instant */
const PRECACHE = [
  "/",
  "/index.html",
  "/css/site.css",
  "/js/app.js",
  "/js/spline-lazy-bootstrap.js",
  "/manifest.webmanifest",
  /* Hero poster: shown immediately as background */
  "/assets/hero-poster.webp",
  /* Logo: visible on every page (nav + footer) */
  "/assets/logo-DKIUXeE4.png",
  /* Favicon: shown in browser tab + bookmarks */
  "/assets/favicon.svg",
  "/assets/astarter-tab-logo.png",
  /* Core image (used in gateway center) */
  "/assets/core-BRYOy9yX.png",
  /* Optimized SVGs (now small enough to precache) */
  "/assets/gateway-circuit.svg",
  "/assets/gateway-lottie-1.svg",
  "/assets/gateway-lottie-2.svg",
  "/assets/gateway-lottie-3.svg",
];

/* ── Install: aggressively precache the shell ── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL)
      .then((cache) =>
        /* addAll fails if any single request fails — wrap individually so
         * a single 404 doesn't block the whole install. */
        Promise.all(
          PRECACHE.map((url) =>
            cache.add(url).catch((err) => console.warn("[sw] skip precache", url, err))
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: clean up old cache versions ── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => {
              console.log("[sw] purging stale cache", k);
              return caches.delete(k);
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ── Helpers ── */
function isImage(url, dest) {
  if (dest === "image" || dest === "video") return true;
  return /\.(webp|png|jpe?g|gif|svg|mp4|webm|woff2?|glb)$/i.test(url.pathname);
}
function isScript(url, dest) {
  if (dest === "script" || dest === "style") return true;
  return /\.(js|css)$/i.test(url.pathname);
}

/* ── Fetch routing ── */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  /* Cross-origin: pass-through (don't intercept jsDelivr / Spline / fonts) */
  if (url.origin !== self.location.origin) return;

  /* Service worker itself: never intercept */
  if (url.pathname === "/sw.js") return;

  /* ── HTML / navigation: network-first ──
   * Ensures deployments are live immediately; falls back to cache offline. */
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((r) => r || caches.match("/"))
        )
    );
    return;
  }

  /* ── Images / video / fonts / 3D models: cache-first ──
   * These rarely change (filenames are versioned). Skip network entirely
   * on repeat. Result: hero poster + logos + partners load in 0 ms. */
  if (isImage(url, req.destination)) {
    event.respondWith(
      caches.open(MEDIA).then((cache) =>
        cache.match(req).then((cached) => {
          if (cached) return cached;
          return fetch(req).then((res) => {
            if (res && res.status === 200 && res.type !== "opaque") {
              cache.put(req, res.clone());
            }
            return res;
          });
        })
      )
    );
    return;
  }

  /* ── JS / CSS: stale-while-revalidate ──
   * Serve from cache instantly, refresh in background.
   *
   * ignoreSearch: true is the critical bit — versioned requests like
   * /css/site.css?v=3.1 match the precache entry stored under /css/site.css
   * (no query). Without this, the entire JS/CSS precache benefit was
   * silently dead: cache had the file, but cache.match couldn't find it
   * because the query string didn't match.
   *
   * We also normalise the put key (strip query) so the cache never
   * accumulates duplicate entries across version bumps. */
  if (isScript(url, req.destination)) {
    event.respondWith(
      caches.open(STATIC).then((cache) =>
        cache.match(req, { ignoreSearch: true }).then((cached) => {
          const network = fetch(req)
            .then((res) => {
              if (res && res.status === 200) {
                /* Store under the path WITHOUT query so future versioned
                 * URLs match the same cache entry. */
                const keyUrl = url.origin + url.pathname;
                cache.put(keyUrl, res.clone());
              }
              return res;
            })
            .catch(() => cached);
          return cached || network;
        })
      )
    );
    return;
  }

  /* ── Default: network with cache fallback ── */
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

/* ── Message channel: let the page trigger cache management ── */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
