# Astarter — Web4 AI DePIN Network

Production website source for [astarter.io](https://astarter.io) — the Web4 DePIN AI-native network powered by ENI.

Optimised, accessible, PWA-ready static site. Built as pure HTML / CSS / vanilla JS with progressive enhancement.

---

## Quick start

```bash
# Serve locally with proper cache headers (mimics production)
python cached_server.py 8080

# Then open
http://localhost:8080/

# FPS diagnostic mode
http://localhost:8080/?fps
```

---

## Tech overview

| Layer | What it does |
|---|---|
| `index.html` | Single-page entry. SEO, OG, Twitter Card, JSON-LD, PWA manifest, security meta |
| `css/site.css` | All styles. Self-hosted fonts (Poppins, Inter). Mobile + reduce-motion + reduce-data variants |
| `js/app.js` | All JS. rAF-throttled scroll dispatcher with read/write phase separation. IntersectionObserver-driven Three.js + Spline + video + marquee pause-when-offscreen |
| `js/spline-lazy-bootstrap.js` | Dynamic-imports `@splinetool/viewer` only when scrolled near the Nodes section |
| `sw.js` | Service worker — pre-caches shell, cache-first for images, network-first for HTML |
| `manifest.webmanifest` | PWA manifest (installable on Android Chrome) |
| `cached_server.py` | Local dev server with production-style HTTP cache headers |

---

## Asset pipeline

| Folder | Contents |
|---|---|
| `assets/` | Hero video + poster, 3D model textures, gateway lottie SVGs, partner logos (WebP), news thumbnails, fonts |
| `assets/fonts/` | Self-hosted Poppins (400, 500, 600, 700, 800) + Inter (600). Zero third-party font requests |
| `assets/news/` | Real article cover thumbnails (WebP) — sourced from Medium |
| `models/` | `MiniPC.glb` — Draco-compressed chip model for the ABOX Three.js scene |

---

## Performance highlights

- **Self-hosted fonts** (no `fonts.googleapis.com` requests — Brave-friendly)
- **Service worker** v2.0 caches everything: instant repeat visits, offline-capable
- **rAF-throttled scroll** with batched read/write phases → eliminates layout thrashing
- **Three.js + Spline** pause when off-screen (IntersectionObserver-driven)
- **Hero**: instant WebP poster + capability-gated optional video (saves 1.9 MB on low-end / 2G / saveData)
- **`content-visibility: auto`** only on bottom sections (footer, etc.) where reverse-scroll cost is minimal
- **`contain: layout style`** on middle sections — fast in both scroll directions
- **All scripts deferred** (`defer` or `type=module`)
- **Cache-Control headers** via `cached_server.py` mimic production CDN config

---

## SEO + PWA

- ✅ Open Graph + Twitter Card + JSON-LD (Organization + WebSite + Product)
- ✅ `sitemap.xml` + `robots.txt`
- ✅ PWA manifest + service worker (installable)
- ✅ Security: CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy via meta
- ✅ Accessibility: skip-link, ARIA landmarks, focus-visible, `prefers-reduced-motion`
- ✅ Reduced-data / saveData / slow-2G aware

---

## Deployment

This is a static site. Deploy by uploading the project root to any static host (nginx, Cloudflare Pages, Vercel, S3+CDN).

Configure your server to send these `Cache-Control` headers (matches `cached_server.py`):

| Path | Cache-Control |
|---|---|
| `/index.html`, `/sw.js`, `/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml` | `no-cache, must-revalidate` |
| `/css/*.css`, `/js/*.js` (non-fingerprinted) | `public, max-age=3600, must-revalidate` |
| `/assets/*-<hash>.{js,css,png,jpg,jpeg,webp,svg}` (Vite-style fingerprint) | `public, max-age=31536000, immutable` |
| `/assets/*.{webp,png,jpg,jpeg,mp4,webm,svg,woff2,glb}` | `public, max-age=2592000` |

---

## Local development

The included `cached_server.py` is a drop-in replacement for `python -m http.server` that sends production-style cache headers, so local dev matches production behaviour.

For an FPS overlay during scroll, append `?fps` to any URL: `http://localhost:8080/?fps`.

## Performance auto-fallback

The site auto-detects two conditions that cause lag and engages `.perf-mode` automatically:

1. **WebGL software rendering detected** (Chrome falls back to SwiftShader when hardware acceleration is broken/disabled) — engaged on page load
2. **Sustained < 30 fps for 2 seconds** — engaged dynamically; auto-released when FPS recovers > 55 fps for 4 seconds

In `.perf-mode`:
- All CSS animations + transitions disabled
- Backdrop-filter blur disabled (nav goes opaque)
- Partner marquee freezes (no scroll-animation)
- Hero Ken Burns paused
- 3D canvases (Three.js + Spline) hidden via `visibility: hidden`

This guarantees the page remains responsive even on machines where Chrome's hardware acceleration is broken.

## Troubleshooting Chrome-specific lag

If users report lag in Chrome but not Brave / Firefox / Edge, the cause is almost always **broken hardware acceleration on their Chrome install**. Have them check:

1. `chrome://gpu/` → look at **"Graphics Feature Status"**. Every line should say "Hardware accelerated". If any says "Software only" or is yellow/red, hardware acceleration is degraded.
2. `chrome://settings/system` → "Use hardware acceleration when available" → should be **ON**. Toggle it off + on + restart Chrome.
3. Windows: **Settings → Display → Graphics → Chrome → High Performance** GPU (not Integrated)
4. Test in **Incognito mode with all extensions disabled** — confirms whether extensions (Grammarly, ad blockers) are the cause
5. Update GPU drivers

The code-side optimizations are at the theoretical maximum; further smoothness requires fixing the user's Chrome environment.

---

## License

Proprietary — © Astarter. All rights reserved.
