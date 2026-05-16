/* Three.js + GLTFLoader 由 index.html 中以普通 <script> 引入，全局为 THREE（支持 file:// 与任意静态服务器） */

/** Site root: same folder as index.html, or origin + basePath for subdirectory deploys */
function normalizeBasePath(p) {
  if (p == null || p === "") return "";
  let s = String(p).trim().replace(/\\/g, "/");
  if (!s.endsWith("/")) s += "/";
  if (!s.startsWith("/")) s = "/" + s;
  return s;
}

function siteRootHref() {
  const cfg = typeof window !== "undefined" ? window.ASTARTER_CONFIG || {} : {};
  const bp = normalizeBasePath(cfg.basePath);
  if (bp) {
    return new URL(bp.slice(1), `${window.location.origin}/`).href;
  }
  return new URL("./", document.baseURI).href;
}

function fileUrl(relativePath) {
  const clean = String(relativePath).replace(/^\/+/, "");
  return new URL(clean, siteRootHref()).href;
}

function assetUrl(filename) {
  const name = String(filename).replace(/^\//, "").replace(/^assets\//, "");
  return fileUrl(`assets/${name}`);
}

function modelUrl(filename) {
  const name = String(filename).replace(/^\//, "").replace(/^models\//, "");
  return fileUrl(`models/${name}`);
}

/** Absolute URLs for media (helps some hosts / mixed-content edge cases) */
function patchResolvedAssetUrls() {
  document.querySelectorAll("video source[src]").forEach((s) => {
    const rel = s.getAttribute("src") || "";
    if (rel.startsWith("assets/")) s.src = assetUrl(rel.replace(/^assets\//, ""));
  });
  document.querySelectorAll("img[src]").forEach((img) => {
    const rel = img.getAttribute("src") || "";
    if (rel.startsWith("assets/")) img.src = assetUrl(rel.replace(/^assets\//, ""));
  });
}

function initNodesSplineViewer() {
  const cfg = typeof window !== "undefined" ? window.ASTARTER_CONFIG || {} : {};
  const custom = cfg.splineNodesUrl;
  if (!custom) return;
  const el = document.getElementById("nodes-spline-viewer");
  if (el) el.setAttribute("url", custom);
}

/**
 * Spline-viewer runs its own internal WebGL rAF loop we can't pause externally.
 *
 * Earlier I used `display:none` to fully halt it — but display:none UNMOUNTS the
 * custom element, so when you scroll back UP from the footer, Spline reloads the
 * entire scene from prod.spline.design (seconds of fetch + parse = visible lag).
 *
 * Fix: use `visibility: hidden` + `pointer-events: none`. The element stays in
 * the DOM (no remount), the GPU stops compositing it (no paint cost), and
 * scroll-up no longer triggers a multi-second reload.
 */
function initSplineViewerPause() {
  const splineEl = document.getElementById("nodes-spline-viewer");
  const section  = document.getElementById("nodes-section") || (splineEl && splineEl.closest("section"));
  if (!splineEl || !section || typeof IntersectionObserver === "undefined") return;
  let hidden = false;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting && !hidden) {
          splineEl.style.visibility = "hidden";
          splineEl.style.pointerEvents = "none";
          hidden = true;
        } else if (e.isIntersecting && hidden) {
          splineEl.style.visibility = "";
          splineEl.style.pointerEvents = "";
          hidden = false;
        }
      }
    },
    { rootMargin: "100% 0px" }
  );
  io.observe(section);
}

const PARTNERS = [
  "partner-101-B2KYfjon.webp",
  "partner-102-2SfMbyCb.webp",
  "partner-105-B1zpbI03.webp",
  "partner-106-CispKaQE.webp",
  "partner-107-DjhPzdXz.webp",
  "partner-108-BWPKxMj-.webp",
  "partner-109-CS1Z98tZ.webp",
  "partner-110-BzOIfSO9.webp",
  "partner-111-Dpgc4wYO.webp",
  "partner-112-BdUc_pfs.webp",
  "partner-113-DObl6TLA.webp",
  "partner-114-COMjR95x.webp",
  "partner-115-Cqpgwm43.webp",
  "partner-116-BhqdEds4.webp",
  "partner-119-C0oCUnBS.webp",
  "partner-120-CDdSknb4.webp",
  "partner-121-DBc9sLM0.webp",
  "partner-122-53Stqa8i.webp",
  "partner-123-G3tK6-89.webp",
  "partner-201-CGMeVcx6.webp",
  "partner-202-CXXaQQG7.webp",
  "partner-203-BULibwGh.webp",
  "partner-204-B269Bd0X.webp",
  "partner-205-DjHzB_LC.webp",
  "partner-207-CdJDd7Z5.webp",
  "partner-208-CltLZ3pb.webp",
  "partner-209-BAfRmm4G.webp",
  "partner-210-C4MUKHkK.webp",
  "partner-211-DAC0IKdl.webp",
  "partner-212-Y15EQ2Ge.webp",
  "partner-215-CdoKtuTH.webp",
  "partner-216-CT9V-H9u.webp",
  "partner-217-Cz-OmZGI.webp",
  "partner-218-BO-cyF9C.webp",
  "partner-219-DTDuwERH.webp",
  "partner-305-CPzl2Y_y.webp",
  "partner-307-B6PDiMUq.webp",
  "partner-309-DhPrxG1R.webp",
];

const BLOG = [
  {
    href: "https://adaverseaccelerator.medium.com/incubated-by-emurgo-adaverse-how-does-astarter-become-cardanos-core-defi-infrastructure-3bcbd48c3b12",
    image: "assets/news/news-1.webp",
    title: "Incubated by EMURGO & ADAVERSE: How Does Astarter Become Cardano's Core DeFi Infrastructure?",
    date: "2023/07/11",
  },
  {
    href: "https://medium.com/astarter/astarter-at-the-siban-digital-asset-summit-fostering-cardano-adoption-in-africa-ed5f45a4d96d",
    image: "assets/news/news-2.webp",
    title: "Astarter at the SiBAN Digital Asset Summit: Fostering Cardano Adoption in Africa",
    date: "2023/09/11",
  },
  {
    href: "https://medium.com/astarter/announcing-astarter-ispo-v2-0-092033b59724",
    image: "assets/news/news-3.webp",
    title: "Announcing Astarter ISPO v2.0",
    date: "2024/07/23",
  },
  {
    href: "https://medium.com/astarter/astarter-2024-year-in-review-f8bee62511e1",
    image: "assets/news/news-4.webp",
    title: "Astarter 2024 Year in Review",
    date: "2024/12/27",
  },
  {
    href: "https://www.emurgo.io/press-news/emurgo-announces-astarter-joint-venture-to-lead-defi-development-for-cardano/",
    image: "assets/news/news-5.webp",
    title: "EMURGO Announces Astarter Project to Foster DeFi Development for Cardano",
    date: "2021/09/16",
  },
];

const TOKEN_SEGMENTS = [
  { name: "Staking Ecosystem", sub: "Staking ecosystem allocation", pct: 42, amt: "420,000,000", color: "#6f00ff" },
  { name: "Ecosystem Construction", sub: "Ecosystem development allocation", pct: 38, amt: "380,000,000", color: "#9d5cff" },
  { name: "Market Value Management", sub: "Market & treasury management", pct: 10, amt: "100,000,000", color: "#e040fb" },
  { name: "Investment & Research", sub: "Investment research allocation", pct: 5, amt: "50,000,000", color: "#bf7fff" },
  { name: "Node Airdrop", sub: "Node airdrop allocation", pct: 4, amt: "40,000,000", color: "#00c2ff" },
  { name: "Community Incentives", sub: "Community incentive allocation", pct: 1, amt: "10,000,000", color: "#5dffe6" },
];

/* ── Shared rAF-throttled scroll dispatcher with READ/WRITE phases ──
 *
 * Root-cause fix for scroll lag: layout thrashing.
 *
 * The old design ran 4 scroll handlers in sequence, each doing read-then-
 * write. Browser had to FLUSH LAYOUT 3 times per rAF (because each write
 * invalidated layout for the next read). At 120Hz scroll = 360 forced
 * layouts/sec — the "stuck" feeling.
 *
 * The new design separates handlers into two phases:
 *   1. ALL READS first (getBoundingClientRect, scrollY, dimensions) →
 *      ONE layout flush total
 *   2. ALL WRITES after (classList, style.transform) →
 *      no flushes between (browser batches them for the next paint)
 *
 * Result: 1 layout flush per scroll tick instead of 3 (or more).
 *
 * Per Chrome DevRel + Paul Irish layout-trigger list, this is the
 * canonical fix for scroll jank when multiple consumers track position.
 */
const _scrollReadFns = [];   // fn() -> state-object (no DOM writes!)
const _scrollWriteFns = [];  // fn(state) -> void (no DOM reads!)
let _scrollScheduled = false;

function _onScrollRaf() {
  if (_scrollScheduled) return;
  _scrollScheduled = true;
  requestAnimationFrame(() => {
    _scrollScheduled = false;
    /* PHASE 1: READS — gather all measurements before any write */
    const states = new Array(_scrollReadFns.length);
    for (let i = 0; i < _scrollReadFns.length; i++) {
      try { states[i] = _scrollReadFns[i](); } catch (_) { states[i] = null; }
    }
    /* PHASE 2: WRITES — apply DOM changes; no rect reads allowed here */
    for (let i = 0; i < _scrollWriteFns.length; i++) {
      try { _scrollWriteFns[i](states[i]); } catch (_) {}
    }
  });
}

/* Legacy single-fn API (still supported — wraps as a no-op read + the fn
 * as a write). Each handler internally does its own read+write, so we
 * accept the small old-style overhead for non-converted handlers. */
function onScroll(fn) {
  _scrollReadFns.push(() => null);
  _scrollWriteFns.push(() => { try { fn(); } catch (_) {} });
  fn();
}

/* NEW API: register split read/write functions. Handlers should use this
 * to get full thrash-free benefit. */
function onScrollSplit(readFn, writeFn) {
  _scrollReadFns.push(readFn);
  _scrollWriteFns.push(writeFn);
  /* Initial run */
  try {
    const s = readFn();
    writeFn(s);
  } catch (_) {}
}

if (typeof window !== "undefined") {
  window.addEventListener("scroll", _onScrollRaf, { passive: true });
  window.addEventListener("resize", _onScrollRaf, { passive: true });
}

function showToast(message) {
  let root = document.getElementById("toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    document.body.appendChild(root);
  }
  const el = document.createElement("div");
  el.className = "toast-msg";
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function initVideoA11y() {
  const video = document.querySelector(".hero__video");
  if (!video) return;

  /* ── Hero video disabled entirely ──
   * The source video (1280×720 @ 738 kbps) has compression artifacts baked
   * into the file — even at 1080p sharpened with unsharp mask, it looks
   * blurry on modern displays AND costs ~30fps of continuous decode work.
   * The sharp 1920×1080 WebP poster (set as CSS background on .hero) gives
   * a better visual result with ZERO decode cost.
   *
   * To re-enable the video (e.g. once the team delivers a proper master),
   * set ASTARTER_CONFIG.enableHeroVideo = true before this script runs. */
  const cfg = (typeof window !== "undefined" && window.ASTARTER_CONFIG) || {};
  const skipVideo = !cfg.enableHeroVideo;

  if (skipVideo) {
    /* Make the <video> element disappear entirely — the CSS background
     * poster on .hero remains visible. No download, no decode, no GPU. */
    video.pause();
    video.removeAttribute("autoplay");
    video.preload = "none";
    video.removeAttribute("src");
    while (video.firstChild) video.removeChild(video.firstChild);
    video.load();
    video.style.display = "none";

    /* Pause the Ken Burns CSS animation when hero is out of viewport.
     * Otherwise the GPU keeps applying a 24s scale transform forever, even
     * when user is at the footer. */
    const hero = document.querySelector(".hero");
    if (hero && typeof IntersectionObserver !== "undefined") {
      new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            hero.classList.toggle("hero--paused", !e.isIntersecting);
          }
        },
        { threshold: 0 }
      ).observe(hero);
    }
    return;
  }

  /* Capable device: kick off load + play on demand, pause off-screen.
   *
   * Aggressive throttling (per user request — reduces lag while keeping
   * the video visible while you're looking at it):
   *
   *   - preload="metadata" instead of "auto" — only fetches the moov atom
   *     and codec info upfront (~50 KB) instead of the full 5.4 MB. The
   *     full payload only downloads when the video actually plays.
   *
   *   - IntersectionObserver threshold raised from 0.01 → 0.3 — pauses
   *     decoding once 70% of the video is off-screen instead of waiting
   *     until 99% is gone. Cuts continuous-decode CPU cost roughly in
   *     half (the bottom 30% of the hero scrolls past first; after that
   *     the video sits paused while the rest of the page is in view). */
  video.preload = "metadata";

  if (typeof IntersectionObserver === "undefined") {
    video.load();
    video.play().catch(() => {});
    return;
  }

  let loaded = false;
  new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          if (!loaded) {
            /* Upgrade preload only once we know the user is going to see it */
            video.preload = "auto";
            video.load();
            loaded = true;
          }
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    },
    { threshold: 0.3 }
  ).observe(video);
}

function initNav() {
  const nav = document.getElementById("site-nav");
  const burger = document.getElementById("nav-burger");
  const drawer = document.getElementById("nav-drawer");

  let _lastScrolled = null;
  let _lastDeep = null;
  onScrollSplit(
    /* READ: window.scrollY + innerHeight don't force layout (cached values) */
    () => {
      if (!nav) return null;
      const y = window.scrollY;
      return { scrolled: y > 24, deep: y > window.innerHeight * 2 };
    },
    /* WRITE: just classList toggles */
    (state) => {
      if (!state) return;
      if (state.scrolled !== _lastScrolled) {
        nav.classList.toggle("site-nav--scrolled", state.scrolled);
        _lastScrolled = state.scrolled;
      }
      if (state.deep !== _lastDeep) {
        nav.classList.toggle("site-nav--solid", state.deep);
        _lastDeep = state.deep;
      }
    }
  );

  function setOpen(open) {
    burger?.classList.toggle("is-open", open);
    drawer?.classList.toggle("is-open", open);
    /* Keep the burger's accessible state in sync so screen readers
     * announce "Open menu, collapsed" / "expanded" correctly. */
    burger?.setAttribute("aria-expanded", String(!!open));
    burger?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (burger && drawer) {
    burger.addEventListener("click", () => {
      setOpen(!drawer.classList.contains("is-open"));
    });
    drawer.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setOpen(false));
    });
  }

  /* Submenu toggle — works on every viewport size so keyboard users on
   * desktop can open submenus (previously a `window.innerWidth > 900`
   * early-return left desktop dropdowns hover-only, which made the 14
   * submenu links keyboard-unreachable). The CSS rule `.site-nav__item:
   * focus-within .site-nav__sub` provides keyboard parity with :hover so
   * Tab also reveals the menu without needing a click. */
  document.querySelectorAll(".site-nav__item--has-sub").forEach((item) => {
    const trigger = item.querySelector(".site-nav__trigger");
    if (!trigger) return;
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const open = item.classList.contains("is-open");
      document.querySelectorAll(".site-nav__item--has-sub.is-open").forEach((el) => {
        if (el !== item) {
          el.classList.remove("is-open");
          el.querySelector(".site-nav__trigger")?.setAttribute("aria-expanded", "false");
        }
      });
      item.classList.toggle("is-open", !open);
      trigger.setAttribute("aria-expanded", String(!open));
    });
  });

  /* Escape key closes any open submenu and returns focus to its trigger */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".site-nav__item--has-sub.is-open").forEach((item) => {
      item.classList.remove("is-open");
      const t = item.querySelector(".site-nav__trigger");
      t?.setAttribute("aria-expanded", "false");
      t?.focus();
    });
  });

  document.addEventListener("click", (e) => {
    if (!(e.target instanceof Element)) return;
    if (e.target.closest(".site-nav__item--has-sub")) return;
    document.querySelectorAll(".site-nav__item--has-sub.is-open").forEach((item) => {
      item.classList.remove("is-open");
      item.querySelector(".site-nav__trigger")?.setAttribute("aria-expanded", "false");
    });
  });
}

function initReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

function initNarrativeWords() {
  const container = document.querySelector(".story__text");
  if (!container) return;
  const words = [...container.querySelectorAll(".story__word")];
  let lastCut = -1;
  onScrollSplit(
    /* READ phase: only DOM measurements, NO writes */
    () => {
      const rect = container.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return null;
      const total = container.offsetHeight - window.innerHeight;
      if (total <= 0) return null;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = scrolled / total;
      return { cut: Math.floor(p * words.length) };
    },
    /* WRITE phase: only DOM mutations, NO reads */
    (state) => {
      if (!state) return;
      const cut = state.cut;
      if (cut === lastCut) return;
      lastCut = cut;
      for (let i = 0; i < words.length; i++) {
        const lit = i >= cut;
        words[i].classList.toggle("story__word--lit", lit);
        words[i].classList.toggle("story__word--dim", !lit);
      }
    }
  );
}

function initAboxCopyReveal() {
  const el = document.getElementById("abox-copy");
  if (!el) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.classList.add("abox__copy--visible");
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          el.classList.add("abox__copy--visible");
          io.disconnect();
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  io.observe(el);
}

function initAboxScroll() {
  const scrollArea = document.getElementById("abox-scroll-area");
  const panels = [...document.querySelectorAll(".abox-panel")];
  const dotsHost = document.getElementById("abox-dots");
  if (!scrollArea || !panels.length || !dotsHost) return;

  if (!dotsHost.children.length) {
    panels.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "abox__dot";
      b.setAttribute("aria-label", `Section ${i + 1}`);
      dotsHost.appendChild(b);
    });
  }
  const dots = [...dotsHost.querySelectorAll(".abox__dot")];

  const n = panels.length;
  let lastIdx = -1;
  onScrollSplit(
    /* READ */
    () => {
      const rect = scrollArea.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return null;
      const total = scrollArea.offsetHeight - window.innerHeight;
      if (total <= 0) return null;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = scrolled / total;
      return { idx: Math.min(n - 1, Math.floor(p * n + 1e-6)) };
    },
    /* WRITE */
    (state) => {
      if (!state) return;
      if (state.idx === lastIdx) return;
      lastIdx = state.idx;
      for (let i = 0; i < n; i++) {
        const isActive = i === state.idx;
        panels[i].classList.toggle("abox-panel--active", isActive);
        /* Toggle aria-hidden so screen readers only announce the active
         * panel — previously SR users heard all 6 versions stacked. */
        panels[i].setAttribute("aria-hidden", String(!isActive));
        if (dots[i]) {
          dots[i].classList.toggle("abox__dot--active", isActive);
          dots[i].setAttribute("aria-current", isActive ? "true" : "false");
        }
      }
    }
  );

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      const total = scrollArea.offsetHeight - window.innerHeight;
      const top = scrollArea.getBoundingClientRect().top + window.scrollY;
      const target = top + (total * i) / Math.max(1, n - 1);
      window.scrollTo({ top: target, behavior: "smooth" });
    });
  });
}


function initCenterSquare() {
  const sq = document.getElementById("gateway-core");
  const text = document.getElementById("gateway-core-text");
  if (!sq) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          sq.classList.add("gateway-core--active");
          text?.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.45 }
  );
  io.observe(sq);
}

function initRoadmap() {
  const section = document.getElementById("roadmap-section");
  const fill = document.getElementById("roadmap-fill");
  if (!section || !fill) return;
  /* If the browser supports CSS scroll-driven animation (Chrome 115+),
   * the roadmap fill is handled entirely on the compositor thread via
   * the @supports rule in site.css. No JS scroll work needed. */
  if (typeof CSS !== "undefined" && CSS.supports && CSS.supports("animation-timeline", "view()")) {
    return;
  }
  let lastScale = -1;
  onScrollSplit(
    /* READ */
    () => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return null;
      const h = section.offsetHeight;
      const vh = window.innerHeight;
      const span = h + vh * 0.5;
      let p = (vh * 0.35 - rect.top) / span;
      p = Math.min(1, Math.max(0, p));
      return { scale: Math.round(p * 100) / 100 };
    },
    /* WRITE */
    (state) => {
      if (!state) return;
      if (state.scale === lastScale) return;
      lastScale = state.scale;
      fill.style.transform = `scaleY(${state.scale})`;
    }
  );
}

function polar(cx, cy, r, angleRad) {
  return [cx + r * Math.cos(angleRad), cy + r * Math.sin(angleRad)];
}

function donutSlice(cx, cy, r0, r1, a0, a1) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0o, y0o] = polar(cx, cy, r1, a0);
  const [x1o, y1o] = polar(cx, cy, r1, a1);
  const [x0i, y0i] = polar(cx, cy, r0, a1);
  const [x1i, y1i] = polar(cx, cy, r0, a0);
  return [
    `M ${x0o} ${y0o}`,
    `A ${r1} ${r1} 0 ${large} 1 ${x1o} ${y1o}`,
    `L ${x0i} ${y0i}`,
    `A ${r0} ${r0} 0 ${large} 0 ${x1i} ${y1i}`,
    "Z",
  ].join(" ");
}

function initTokenomics() {
  const host = document.getElementById("tokenomics-pie");
  if (!host) return;
  const cx = 194;
  const cy = 220;
  const r1 = 175;
  const r0 = 95;
  let angle = -Math.PI / 2;
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 388 440");
  svg.setAttribute("width", "100%");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "$AA Token distribution: 42% Staking Ecosystem, 38% Ecosystem Construction, 10% Market Value Management, 5% Investment & Research, 4% Node Airdrop, 1% Community Incentives");
  svg.style.maxWidth = "480px";
  svg.style.height = "auto";
  svg.style.display = "block";

  /* Cache legend items + memoize active state — was querying DOM on every
   * mouseenter/mouseleave (6 segments × 60Hz pointer = up to 360 queries/s) */
  const legendItems = [...document.querySelectorAll(".tokenomics__legend-item")];
  let lastActive = null;
  function setLegendActive(name) {
    if (lastActive === name) return;
    lastActive = name;
    for (let i = 0; i < legendItems.length; i++) {
      legendItems[i].classList.toggle(
        "tokenomics__legend-item--active",
        legendItems[i].dataset.seg === name
      );
    }
  }
  function clearLegendActive() {
    if (lastActive === null) return;
    lastActive = null;
    for (let i = 0; i < legendItems.length; i++) {
      legendItems[i].classList.remove("tokenomics__legend-item--active");
    }
  }

  TOKEN_SEGMENTS.forEach((seg) => {
    const sweep = (seg.pct / 100) * 2 * Math.PI;
    const a0 = angle;
    const a1 = angle + sweep;
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", donutSlice(cx, cy, r0, r1, a0, a1));
    path.setAttribute("fill", seg.color);
    path.setAttribute("stroke", "#fff");
    path.setAttribute("stroke-width", "0");
    path.style.cursor = "pointer";
    path.style.transition = "opacity 0.25s ease";
    path.addEventListener("mouseenter", () => {
      path.style.opacity = "0.88";
      setLegendActive(seg.name);
    });
    path.addEventListener("mouseleave", () => {
      path.style.opacity = "1";
      clearLegendActive();
    });
    svg.appendChild(path);
    angle = a1;
  });

  host.appendChild(svg);

  document.querySelectorAll(".tokenomics__legend-item").forEach((row) => {
    row.addEventListener("click", () => {
      clearLegendActive();
      row.classList.add("tokenomics__legend-item--active");
    });
  });
}

function buildPartnerTrack(track, files) {
  if (!track || !files.length) return;
  const frag = document.createDocumentFragment();
  const addImgs = () => {
    files.forEach((file) => {
      const wrap = document.createElement("div");
      wrap.className = "partner-marquee__card";
      const img = document.createElement("img");
      img.src = assetUrl(file);
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      img.loading = "lazy";
      img.decoding = "async";
      img.onerror = () => {
        wrap.textContent = "";
        wrap.style.background = "#2a2a2a";
        wrap.style.minWidth = "120px";
      };
      wrap.appendChild(img);
      frag.appendChild(wrap);
    });
  };
  addImgs();
  addImgs();
  track.appendChild(frag);
}

function initPartners() {
  const t1 = document.getElementById("partners-track-1");
  const t2 = document.getElementById("partners-track-2");
  const half = Math.ceil(PARTNERS.length / 2);
  const row1 = PARTNERS.slice(0, half);
  const row2 = PARTNERS.slice(half);
  buildPartnerTrack(t1, row1.length ? row1 : PARTNERS);
  buildPartnerTrack(t2, row2.length ? row2 : PARTNERS);

  /* Pause animation AND remove compositor-layer promotion when offscreen.
   * `will-change` is moved onto a class that JS toggles, so when paused the
   * browser can drop the GPU texture (frees memory).
   *
   * Note: previously this also paused during active scroll (Apple-Maps
   * pattern) to prevent compositor-thread thrash. That was REMOVED — users
   * want the marquee to scroll continuously as expected. The auto-perf-
   * mode system (engages at <45 fps) handles severe-lag scenarios
   * separately. */
  const section = document.querySelector(".partner-marquee");
  if (!section || typeof IntersectionObserver === "undefined") return;
  const tracks = section.querySelectorAll(".partner-marquee__track");
  new IntersectionObserver(
    (entries) => {
      const visible = entries[0] && entries[0].isIntersecting;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].style.animationPlayState = visible ? "running" : "paused";
        tracks[i].classList.toggle("is-active", visible);
      }
    },
    { rootMargin: "100px 0px" }
  ).observe(section);
}

function buildBlogCarousel() {
  const desk = document.getElementById("blog-track-desktop");
  const mob = document.getElementById("blog-track-mobile");
  if (!desk && !mob) return;

  function buildCard(c) {
    const a = document.createElement("a");
    a.href = c.href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "news-card";

    const thumb = document.createElement("div");
    thumb.className = "news-card__thumb";
    const img = document.createElement("img");
    img.alt = c.title;
    /* No loading="lazy" — Brave's lazy-load IntersectionObserver fires
     * unreliably when cards are appended via requestIdleCallback (gets
     * mis-classified as "permanently off-screen" if appended late).
     * decoding="async" + fetchpriority="low" keep them low-priority
     * without the misfire risk. Total payload: 5 × ~25 KB = 125 KB. */
    img.decoding = "async";
    img.fetchPriority = "low";
    img.src = c.image;
    thumb.appendChild(img);

    const body = document.createElement("div");
    body.className = "news-card__body";
    const h3 = document.createElement("h3");
    h3.className = "news-card__title";
    h3.textContent = c.title;
    const p = document.createElement("p");
    p.className = "news-card__date";
    p.textContent = c.date;
    body.appendChild(h3);
    body.appendChild(p);

    a.appendChild(thumb);
    a.appendChild(body);
    return a;
  }

  if (desk) {
    const frag = document.createDocumentFragment();
    [...BLOG, ...BLOG].forEach((c) => frag.appendChild(buildCard(c)));
    desk.appendChild(frag);
  }
  if (mob) {
    const frag = document.createDocumentFragment();
    BLOG.forEach((c) => frag.appendChild(buildCard(c)));
    mob.appendChild(frag);
  }

  const viewport = document.querySelector(".news__desktop .news__viewport");
  const track = desk;
  const prev = document.querySelector('.news__desktop [data-carousel="prev"]');
  const next = document.querySelector('.news__desktop [data-carousel="next"]');
  const dotsHost = document.getElementById("news-dots");
  if (!viewport || !track || !prev || !next || !dotsHost) return;

  track.style.transition = "transform 420ms cubic-bezier(0.4, 0, 0.2, 1)";

  let index = 0;
  const maxIndex = BLOG.length;

  function cardWidth() {
    const card = track.querySelector(".news-card");
    if (!card) return 200;
    const gap = 16;
    return card.getBoundingClientRect().width + gap;
  }

  function render() {
    const w = cardWidth();
    track.style.transform = `translateX(${-index * w}px)`;
    dotsHost.innerHTML = "";
    BLOG.forEach((_, i) => {
      const d = document.createElement("button");
      d.type = "button";
      d.className = "news__dot" + (i === index % BLOG.length ? " news__dot--active" : "");
      d.setAttribute("aria-label", `Slide ${i + 1}`);
      d.addEventListener("click", () => {
        index = i;
        render();
      });
      dotsHost.appendChild(d);
    });
  }

  prev.addEventListener("click", () => {
    index = (index - 1 + maxIndex) % maxIndex;
    render();
  });
  next.addEventListener("click", () => {
    index = (index + 1) % maxIndex;
    render();
  });
  let _resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(render, 150);
  });
  render();
}

function initNewsletter() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector(".subscribe__input");
    const btn = form.querySelector(".subscribe__submit");
    if (btn) btn.disabled = true;
    showToast(input?.value ? "Thanks — you're on the list." : "Please enter an email.");
    if (btn) setTimeout(() => (btn.disabled = false), 800);
    if (input) input.value = "";
  });
}

/**
 * 官网 AboxScene：Environment potsdamer_platz_1k.hdr；四盏灯；Canvas alpha、无地面；滚动插值相机。
 * 仅串行加载一张 1k HDR（先 potsdamer，失败再试列表），慢网下避免双倍 Poly Haven。
 * hdrUrl 可改为自建 CDN。threejs.org/examples 部分 HDR 已 404。
 */
const HDR_CANDIDATES = [
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr",
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/spruit_sunrise_1k.hdr",
];

/* 与官网 index 包中 CAMERA_SHOTS 一致 */
const ABOX_CAMERA_SHOTS = [
  [0, 0, 4],
  [-2.8, 0.8, 2.5],
  [0, 0, -4],
  [1.5, 3.2, -3],
  [3.5, 0.3, 1.5],
  [0.5, 0, 4],
];

function getAboxScrollProgress(scrollAreaId) {
  const el = typeof document !== "undefined" ? document.getElementById(scrollAreaId) : null;
  if (!el || typeof window === "undefined") return 0;
  const total = el.offsetHeight - window.innerHeight;
  if (total <= 0) return 0;
  const rect = el.getBoundingClientRect();
  const scrolled = Math.min(Math.max(-rect.top, 0), total);
  return scrolled / total;
}

/* 只拉取、Draco 解码、归一化一次 MiniPC，两处 Canvas 用 clone — 避免双倍等待与带宽争抢 */
let miniPcTemplatePromise = null;

function prepareMiniPcTemplateOnce() {
  if (miniPcTemplatePromise) return miniPcTemplatePromise;
  miniPcTemplatePromise = new Promise((resolve, reject) => {
    const canLoadGlb = typeof location === "undefined" || location.protocol !== "file:";
    if (!canLoadGlb || typeof THREE === "undefined" || typeof THREE.GLTFLoader !== "function") {
      reject(new Error("glb-skip"));
      return;
    }
    const cfg = typeof window !== "undefined" ? window.ASTARTER_CONFIG || {} : {};
    const loader = new THREE.GLTFLoader();
    loader.setCrossOrigin("anonymous");
    if (typeof THREE.DRACOLoader === "function") {
      const draco = new THREE.DRACOLoader();
      draco.setDecoderPath(
        cfg.dracoDecoderPath ||
          "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/gltf/"
      );
      loader.setDRACOLoader(draco);
    }
    const queue = [modelUrl("MiniPC.glb")];
    if (Array.isArray(cfg.extraModelUrls)) {
      cfg.extraModelUrls.forEach((u) => {
        if (u && queue.indexOf(u) === -1) queue.push(u);
      });
    }
    function tryLoad(index) {
      if (index >= queue.length) {
        console.warn(
          "MiniPC.glb 加载失败：请把 models/MiniPC.glb 部署到与页面同源的路径（或配置 basePath）。跨域地址需在目标服务器开启 CORS，astarter 官网模型不可跨站引用。",
          queue
        );
        reject(new Error("glb-fail"));
        return;
      }
      loader.load(
        queue[index],
        (gltf) => {
          const m = gltf.scene;
          m.traverse((ch) => {
            if (ch.isMesh) {
              // CPU optimization: don't calculate culling since the MiniPC is always fully in view
              ch.frustumCulled = false;
            }
          });
          const box = new THREE.Box3().setFromObject(m);
          const size = new THREE.Vector3();
          box.getSize(size);
          const max = Math.max(size.x, size.y, size.z) || 1;
          const s = 1.8 / max;
          m.scale.setScalar(s);
          const c = box.getCenter(new THREE.Vector3());
          m.position.set(-c.x * s, -c.y * s, -c.z * s);
          resolve(m);
        },
        undefined,
        () => tryLoad(index + 1)
      );
    }
    tryLoad(0);
  });
  return miniPcTemplatePromise;
}

function mountThreeScene(containerId, modelPaths, sceneOpts) {
  const wrap = document.getElementById(containerId);
  if (!wrap || typeof THREE === "undefined") return;
  const opts = sceneOpts || {};
  const useScrollCamera = !!opts.useScrollCamera;
  const scrollAreaId = opts.scrollAreaId || "abox-scroll-area";

  /* Mobile/low-power detection. Affects pixel ratio, AA, HDR, tone-mapping.
   * Together these settings cut per-frame GPU work by ~60-70% on mobile while
   * keeping the 3D model visible and shaded. */
  const isMobile = window.matchMedia("(max-width: 900px)").matches;

  const scene = new THREE.Scene();
  scene.background = null;

  const cam = new THREE.PerspectiveCamera(45, 1, 0.08, 120);
  cam.position.set(0, 0, 4);
  cam.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: false, // Turn off antialiasing for significant performance boost on low-end
    alpha: true,
    powerPreference: "low-power", // Best for low-end/mobile devices to manage battery and heat
    stencil: false,
    depth: true,
  });
  /* DPR cap: was 1.5 desktop / 1 mobile. Now 1.25 desktop / 1 mobile for further GPU optimization.
   * Visual diff is nearly invisible, GPU work drops significantly. */
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 1.25));

  renderer.setClearColor(0x000000, 0);
  renderer.physicallyCorrectLights = true;
  renderer.shadowMap.enabled = false;
  if (THREE.sRGBEncoding !== undefined && renderer.outputEncoding !== undefined) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }
  /* ACES tone mapping is a full-screen post-process pass. Skip on mobile. */
  if (!isMobile && THREE.ACESFilmicToneMapping !== undefined) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;
  }
  wrap.innerHTML = "";
  wrap.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("data-engine", "three.js r128");

  /* 官网 AboxScene 灯位与强度（颜色字符串经混淆，此处用白光） */
  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const pt = new THREE.PointLight(0xffffff, 2.5);
  pt.position.set(5, 5, 5);
  scene.add(pt);
  const d1 = new THREE.DirectionalLight(0xffffff, 1.2);
  d1.position.set(-4, 2, -3);
  scene.add(d1);
  const d2 = new THREE.DirectionalLight(0xffffff, 2);
  d2.position.set(0, 3, 3);
  scene.add(d2);

  const pivot = new THREE.Group();
  scene.add(pivot);

  let iblCube = null;

  function applyIblToPivot() {
    if (!iblCube) return;
    if (scene.environment !== iblCube) scene.environment = iblCube;
    pivot.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((mat) => {
        if (mat && (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial)) {
          mat.envMap = iblCube;
          mat.needsUpdate = true;
        }
      });
    });
  }

  function applyHdrTexture(tex) {
    if (!THREE.RGBELoader || !THREE.PMREMGenerator) return;
    tex.mapping = THREE.EquirectangularReflectionMapping;
    const pmrem = new THREE.PMREMGenerator(renderer);
    if (typeof pmrem.compileEquirectangularShader === "function") pmrem.compileEquirectangularShader();
    const rt = pmrem.fromEquirectangular(tex);
    tex.dispose();
    pmrem.dispose();
    if (iblCube && iblCube.dispose) iblCube.dispose();
    iblCube = rt.texture;
    applyIblToPivot();
    if (THREE.ACESFilmicToneMapping !== undefined) renderer.toneMappingExposure = 1.12;
  }

  function startIblLoading() {
    /* HDR + PMREM costs ~30 MB GPU memory + decode time. Mobile is fine
     * with the ambient + directional lights only. */
    if (isMobile) return;
    if (!THREE.RGBELoader || !THREE.PMREMGenerator) return;
    const cfg = typeof window !== "undefined" ? window.ASTARTER_CONFIG || {} : {};
    const loader = new THREE.RGBELoader();
    if (THREE.FloatType !== undefined) loader.setDataType(THREE.FloatType);
    const primary = "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr";
    const urls = cfg.hdrUrl
      ? [cfg.hdrUrl].concat(HDR_CANDIDATES.filter((u) => u !== cfg.hdrUrl))
      : [primary].concat(HDR_CANDIDATES);
    let i = 0;
    function next() {
      if (i >= urls.length) return;
      loader.load(
        urls[i],
        (tex) => applyHdrTexture(tex),
        undefined,
        () => {
          i++;
          next();
        }
      );
    }
    next();
  }
  startIblLoading();

  function aboxCamTarget(progress01) {
    const n = Math.min(1, Math.max(0, progress01));
    const shots = ABOX_CAMERA_SHOTS;
    const a = shots.length;
    const o = n * (a - 1);
    const l = Math.min(Math.floor(o), a - 2);
    const c = o - l;
    const f = c * c * c * (c * (c * 6 - 15) + 10);
    const m = shots[l];
    const u = shots[Math.min(l + 1, a - 1)];
    const x = m[0] + (u[0] - m[0]) * f;
    const y = m[1] + (u[1] - m[1]) * f;
    const z = m[2] + (u[2] - m[2]) * f;
    const v = new THREE.Vector3(x, y, z);
    const d = 3.5;
    const len = v.length();
    if (len < d && len > 1e-6) v.multiplyScalar(d / len);
    return v;
  }

  const camTarget = new THREE.Vector3();
  const reduceMotion =
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let isInView = true;
  let _restartTimer = 0;
  let _stopTimer = 0;
  if (typeof IntersectionObserver !== "undefined") {
    const watchEl = document.getElementById(scrollAreaId) || wrap;
    isInView = false;
    new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const wasIn = isInView;
          isInView = e.isIntersecting;
          /* Debounce start/stop: rapidly scrolling past the section
           * shouldn't repeatedly start+stop the rAF chain (each restart
           * costs a frame). Wait 150ms before actually committing. */
          if (!wasIn && isInView) {
            if (_stopTimer) { clearTimeout(_stopTimer); _stopTimer = 0; }
            _restartTimer = setTimeout(() => {
              if (isInView) startRenderLoop();
              _restartTimer = 0;
            }, 150);
          } else if (wasIn && !isInView) {
            if (_restartTimer) { clearTimeout(_restartTimer); _restartTimer = 0; }
            _stopTimer = setTimeout(() => {
              if (!isInView) stopRenderLoop();
              _stopTimer = 0;
            }, 150);
          }
        }
      },
      /* Asymmetric rootMargin: bigger on top so Three.js starts warming
       * up earlier when user scrolls UP from below (reverse scroll). The
       * 150ms debounce still prevents start/stop thrashing. */
      { rootMargin: "600px 0px 200px 0px" }
    ).observe(watchEl);
  }

  const canLoadGlb = typeof location === "undefined" || location.protocol !== "file:";
  if (canLoadGlb && typeof THREE.GLTFLoader === "function") {
    prepareMiniPcTemplateOnce()
      .then((template) => {
        const m = template.clone(true);
        pivot.add(m);
        applyIblToPivot();
      })
      .catch(() => {});
  }

  function resize() {
    const w = wrap.clientWidth || 400;
    const h = wrap.clientHeight || w;
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  resize();
  new ResizeObserver(resize).observe(wrap);
  /* Hoisted ABOVE the startRenderLoop() call below — these `let` bindings
   * are read by startRenderLoop via the function declaration's closure.
   * If the page runs on a browser without IntersectionObserver (rare but
   * possible), `isInView` stays true from line 1103 and we'd call
   * startRenderLoop() while `_running` is still in its temporal dead zone,
   * throwing a ReferenceError. Hoisting fixes that latent bug. */
  let _rafId = 0;
  let _running = false;

  /* Only run if currently in view. The IntersectionObserver above will
   * call startRenderLoop / stopRenderLoop as the section enters/leaves. */
  if (isInView) startRenderLoop();

  /* ── Adaptive FPS throttling ──
   * Measures rolling FPS over last 60 frames. If sustained <45fps, drop
   * pixel ratio + disable IBL re-application + skip every other frame.
   * If FPS recovers >55, restore. Prevents the GPU from getting stuck
   * trying to render a too-heavy frame on weak hardware. */
  const _frameTimes = [];
  let _lastFrameAt = 0;
  let _qualityLevel = "high"; // "high" or "low"
  let _skipNextFrame = false;

  function applyQuality(level) {
    if (level === _qualityLevel) return;
    _qualityLevel = level;
    if (level === "low") {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
      try { renderer.setSize(wrap.clientWidth, wrap.clientHeight, false); } catch (_) {}
    } else {
      renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5));
      try { renderer.setSize(wrap.clientWidth, wrap.clientHeight, false); } catch (_) {}
    }
  }

  function startRenderLoop() {
    if (_running) return;
    _running = true;
    _lastFrameAt = performance.now();
    _frameTimes.length = 0;
    tick();
  }
  function stopRenderLoop() {
    if (!_running) return;
    _running = false;
    if (_rafId) cancelAnimationFrame(_rafId);
    _rafId = 0;
  }
  function tick() {
    if (!_running) return;
    _rafId = requestAnimationFrame(tick);
    if (document.hidden) return;

    /* FPS tracking */
    const now = performance.now();
    const dt = now - _lastFrameAt;
    _lastFrameAt = now;
    if (dt > 0 && dt < 200) {
      _frameTimes.push(dt);
      if (_frameTimes.length > 60) _frameTimes.shift();
      /* Auto-degrade / restore after rolling window full */
      if (_frameTimes.length === 60) {
        let sum = 0;
        for (let i = 0; i < 60; i++) sum += _frameTimes[i];
        const fps = 60000 / sum;
        if (fps < 45 && _qualityLevel === "high") applyQuality("low");
        else if (fps > 55 && _qualityLevel === "low") applyQuality("high");
      }
    }

    /* Frame-skip if heavily degraded — render every other frame */
    if (_qualityLevel === "low") {
      _skipNextFrame = !_skipNextFrame;
      if (_skipNextFrame) return;
    }

    if (useScrollCamera) {
      const p = getAboxScrollProgress(scrollAreaId);
      camTarget.copy(aboxCamTarget(p));
      if (reduceMotion) cam.position.copy(camTarget);
      else cam.position.lerp(camTarget, 0.03);
      cam.lookAt(0, 0, 0);
    }
    renderer.render(scene, cam);
  }
  /* tick is started by startRenderLoop() above, which only fires when
   * the section is actually in view. No bare tick() call here. */

  /* ── Strict memory cleanup ──
   * Three.js does NOT auto-dispose GPU resources. Without explicit dispose:
   *   - geometries leak vertex buffer memory
   *   - materials leak shader compilation
   *   - textures leak GPU texture memory (HDR is 30+ MB!)
   *   - WebGL context itself leaks until tab close
   *
   * We call this on beforeunload + pagehide so the GPU memory is freed
   * before the browser context dies. Also exposed as window.__disposeAbox
   * for manual call from DevTools if needed. */
  function disposeScene() {
    stopRenderLoop();
    /* Walk the scene, dispose geometries, materials, embedded textures */
    scene.traverse((obj) => {
      if (obj.geometry && typeof obj.geometry.dispose === "function") {
        obj.geometry.dispose();
      }
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          if (!m) return;
          /* Dispose any textures referenced by this material */
          for (const key in m) {
            const v = m[key];
            if (v && v.isTexture && typeof v.dispose === "function") {
              v.dispose();
            }
          }
          if (typeof m.dispose === "function") m.dispose();
        });
      }
    });
    /* IBL cubemap */
    if (iblCube && typeof iblCube.dispose === "function") iblCube.dispose();
    /* Renderer + WebGL context */
    if (renderer) {
      try { renderer.dispose(); } catch (_) {}
      try { renderer.forceContextLoss && renderer.forceContextLoss(); } catch (_) {}
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    }
  }

  window.__disposeAbox = disposeScene;
  window.addEventListener("beforeunload", disposeScene, { once: true });
  window.addEventListener("pagehide", disposeScene, { once: true });
}

function initAboxThree() {
  mountThreeScene("abox-canvas-wrap", [modelUrl("MiniPC.glb")], {
    useScrollCamera: true,
    scrollAreaId: "abox-scroll-area",
  });
}

/**
 * 快滚到 ABOX 再拉 Three + Draco + MiniPC + HDR，避免与首屏视频/图片抢带宽。
 * 配置 ASTARTER_CONFIG.eagerLoad3d = true 可恢复一进页就加载。
 */
function initAboxWhenVisible() {
  if (typeof THREE === "undefined") return;
  const cfg = typeof window !== "undefined" ? window.ASTARTER_CONFIG || {} : {};
  const start = () => {
    if (window.__astarterAboxStarted) return;
    window.__astarterAboxStarted = true;
    const can = typeof location === "undefined" || location.protocol !== "file:";
    if (can) prepareMiniPcTemplateOnce();
    initAboxThree();
  };
  if (cfg.eagerLoad3d) {
    start();
    return;
  }
  const anchor = document.getElementById("abox-scroll-area");
  if (!anchor) {
    start();
    return;
  }
  if (typeof IntersectionObserver === "undefined") {
    start();
    return;
  }
  const vh = window.innerHeight || 640;
  const r = anchor.getBoundingClientRect();
  if (r.top < vh + 560 && r.bottom > -200) {
    start();
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        start();
        io.disconnect();
      }
    },
    { rootMargin: "560px 0px 280px 0px", threshold: 0 }
  );
  io.observe(anchor);
}

/* ────────────────────────────────────────────────────────────────────
 * Performance auto-fallback system (NUCLEAR mode)
 *
 * Detects machines where rendering is severely degraded and progressively
 * strips features until the page is responsive. Three escalation levels:
 *
 *   Level 0: normal (full visual fidelity)
 *   Level 1: .perf-mode  — strip animations + backdrop-filter
 *   Level 2: .lite-mode  — dispose Three.js, remove Spline from DOM,
 *                          hide all non-essential decorations
 *
 * Triggers:
 *   • WebGL software-renderer detected (SwiftShader)     → Level 1
 *   • Sustained <45fps for 1s                            → Level 1
 *   • Sustained <20fps for 1.5s OR in perf-mode <30fps  → Level 2 (NUCLEAR)
 *
 * Manual overrides (URL params):
 *   ?perf  — force Level 1 immediately
 *   ?lite  — force Level 2 immediately
 *
 * Visible indicator in bottom-left corner (dot color shows current level).
 * ──────────────────────────────────────────────────────────────────── */
(function perfAutoFallback() {
  return; // Disabled by user request to allow more resources for 3D rendering
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const url = new URL(window.location.href);
  const forcePerf = url.searchParams.has("perf");
  const forceLite = url.searchParams.has("lite");
  let level = 0;
  let lockedReason = ""; // set when Stage-1 detection forces a level

  function setLevel(newLevel, reason) {
    if (newLevel === level) return;
    level = newLevel;
    document.documentElement.classList.toggle("perf-mode", level >= 1);
    document.documentElement.classList.toggle("lite-mode", level >= 2);
    try { console.info("[astarter] perf level=" + level + " (" + reason + ")"); } catch (_) {}
    updateIndicator();
    if (level >= 2) {
      /* NUCLEAR: dispose everything heavy and physically remove DOM
       * elements (not just hide). At <5fps the DOM tree itself is
       * expensive — Chrome's main thread is so slow that even hidden
       * elements cost it cycles to skip.
       *
       * After this, the DOM size drops from ~600 nodes to ~150. */
      try {
        if (typeof window.__disposeAbox === "function") window.__disposeAbox();
        const spline = document.getElementById("nodes-spline-viewer");
        if (spline && spline.parentNode) spline.parentNode.removeChild(spline);

        /* Drop the partner marquee carousels entirely — they had 152 cards */
        document.querySelectorAll("#partners-track-1, #partners-track-2")
          .forEach((track) => { while (track.firstChild) track.removeChild(track.firstChild); });

        /* Drop blog/news carousel cards — keeps the heading visible */
        const blogTrack = document.getElementById("blog-track-desktop");
        if (blogTrack) while (blogTrack.firstChild) blogTrack.removeChild(blogTrack.firstChild);
        const blogTrackMobile = document.getElementById("blog-track-mobile");
        if (blogTrackMobile) while (blogTrackMobile.firstChild) blogTrackMobile.removeChild(blogTrackMobile.firstChild);

        /* Story section: collapse the 35 word spans into plain text */
        const storyText = document.querySelector(".story__text");
        if (storyText) {
          const text = storyText.textContent.trim();
          storyText.innerHTML = "";
          storyText.textContent = text;
        }

        /* Tokenomics: remove the SVG donut (heavy paint) */
        const pie = document.getElementById("tokenomics-pie");
        if (pie) while (pie.firstChild) pie.removeChild(pie.firstChild);

        /* Pause + null all video srcs */
        document.querySelectorAll("video").forEach((v) => {
          try { v.pause(); v.src = ""; v.removeAttribute("src"); v.load(); } catch (_) {}
        });

        /* Show the banner explaining the situation (auto-engaged case only) */
        if (lockedReason !== "manual" && !document.getElementById("perf-banner")) {
          buildBanner();
        }
      } catch (e) {
        try { console.warn("[astarter] lite-mode cleanup error:", e); } catch (_) {}
      }
    }
  }

  /* Top-of-page banner shown when lite-mode auto-engages — politely
   * informs the user their browser has performance issues and links
   * to fixes. Dismissible. */
  function buildBanner() {
    const banner = document.createElement("div");
    banner.id = "perf-banner";
    banner.style.cssText =
      "position:fixed;top:0;left:0;right:0;z-index:99997;" +
      "padding:10px 16px;font:500 13px/1.5 system-ui,sans-serif;" +
      "background:#1a0a40;color:#fff;border-bottom:1px solid #6f00ff;" +
      "display:flex;align-items:center;gap:12px;flex-wrap:wrap;";
    banner.innerHTML =
      '<span style="flex:1;min-width:200px">' +
        '⚡ Your browser is rendering this page in low-performance mode. ' +
        'For full quality, check ' +
        '<a href="chrome://gpu/" target="_blank" style="color:#c4b5fd;text-decoration:underline">chrome://gpu/</a> ' +
        'or try in Incognito (Ctrl+Shift+N) with extensions disabled.' +
      '</span>' +
      '<button id="perf-banner-close" style="background:transparent;border:1px solid rgba(255,255,255,.3);' +
        'color:#fff;padding:4px 12px;border-radius:4px;cursor:pointer;font:inherit">Dismiss</button>';
    document.body.appendChild(banner);
    document.getElementById("perf-banner-close").addEventListener("click", () => {
      banner.remove();
    });
  }

  /* Small indicator dot bottom-left so the user/dev can see if perf-mode
   * is active. Click to manually escalate to the next level. */
  let indicator = null;
  function updateIndicator() {
    if (!indicator) return;
    const colors = ["transparent", "#fc0", "#f33"];
    const labels = ["", " PERF", " LITE"];
    indicator.style.background = colors[level];
    indicator.textContent = labels[level];
  }
  function buildIndicator() {
    indicator = document.createElement("div");
    indicator.style.cssText =
      "position:fixed;bottom:10px;left:10px;z-index:99998;" +
      "padding:3px 8px;font:bold 11px/1 monospace;color:#000;" +
      "border-radius:99px;pointer-events:auto;user-select:none;" +
      "cursor:pointer;opacity:.7;";
    indicator.title = "click to cycle perf level";
    indicator.addEventListener("click", () => {
      const next = (level + 1) % 3;
      lockedReason = "manual";
      setLevel(next, "manual click");
    });
    document.body.appendChild(indicator);
    updateIndicator();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildIndicator);
  } else {
    buildIndicator();
  }

  /* Manual URL override (highest priority) */
  if (forceLite) {
    lockedReason = "?lite param";
    setLevel(2, lockedReason);
    return; /* no need for auto-detection */
  }
  if (forcePerf) {
    lockedReason = "?perf param";
    setLevel(1, lockedReason);
  }

  /* Stage 1: probe WebGL renderer for software-fallback detection */
  function detectSoftwareRenderer() {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return "no-webgl";
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "";
      const vendor = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : "";
      const combined = String(renderer + " " + vendor);
      if (/(SwiftShader|llvmpipe|Software|ANGLE\s*\(Software)/i.test(combined)) {
        return "software:" + renderer;
      }
      return null;
    } catch (e) {
      return null;
    }
  }
  if (!forcePerf && !forceLite) {
    const swReason = detectSoftwareRenderer();
    if (swReason) {
      lockedReason = swReason;
      setLevel(1, swReason);
    }
  }

  /* Stage 2: continuous fps monitoring with escalation.
   *
   * Important guard rails — without these, the auto-fallback was a FOOTGUN
   * that engaged lite-mode during the natural FPS dip of initial page load
   * (script parse + first paint + image decode), then PHYSICALLY REMOVED
   * the Spline viewer and Three.js canvases. After FPS recovered the level
   * was set back to 0 but the DOM elements were gone — so users saw empty
   * black boxes where the 3D scenes should be.
   *
   *  1. WARMUP_MS: ignore the first 3s after page load — that's when the
   *     browser is parsing scripts and doing first paint, not steady-state.
   *  2. Never go DIRECTLY from level 0 → 2. Must pass through 1 first.
   *  3. Lite-mode now requires fps<15 sustained 3s while ALREADY in perf-
   *     mode (was: fps<20 sustained 1.5s from any level). */
  const WARMUP_MS = 3000;
  const PAGE_LOAD_AT = performance.now();
  let frames = 0;
  let lastSample = performance.now();
  let lowFpsStart = 0;
  let criticalFpsStart = 0;
  let highFpsStart = 0;
  function tick(now) {
    frames++;
    if (now - lastSample >= 500) {
      const fps = (frames * 1000) / (now - lastSample);
      frames = 0;
      lastSample = now;

      /* WARMUP: ignore samples taken before the browser has settled.
       * The first 3s after load are dominated by parse/paint costs that
       * have nothing to do with steady-state rendering. */
      if (now - PAGE_LOAD_AT < WARMUP_MS) {
        requestAnimationFrame(tick);
        return;
      }

      /* CRITICAL: <15fps WHILE ALREADY in perf-mode → escalate to LITE
       * (after 3s sustained). Direct 0→2 jumps are gone — you must pass
       * through perf-mode first. */
      if (fps < 15 && level >= 1) {
        if (!criticalFpsStart) criticalFpsStart = now;
        else if (now - criticalFpsStart > 3000) setLevel(2, "fps<15 in perf-mode");
        lowFpsStart = 0;
        highFpsStart = 0;
      }
      /* DEGRADED: <45fps → engage PERF mode after 1s.
       * Perf-mode is cheap and fully reversible (only adds a class). */
      else if (fps < 45) {
        if (!lowFpsStart) lowFpsStart = now;
        else if (now - lowFpsStart > 1000 && level === 0) setLevel(1, "fps<45 sustained");
        criticalFpsStart = 0;
        highFpsStart = 0;
      }
      /* RECOVERED: >55fps → release (only if not locked by Stage 1 or URL).
       * NB: lite-mode is one-way (it physically removed DOM); recovering
       * just clears the class, but the 3D content is permanently gone for
       * this page load. Reload to restore. */
      else if (fps > 55) {
        if (!highFpsStart) highFpsStart = now;
        else if (now - highFpsStart > 4000 && level > 0 && !lockedReason) {
          setLevel(0, "recovered");
        }
        lowFpsStart = 0;
        criticalFpsStart = 0;
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ── FPS counter HUD (diagnostic tool) ──
 * Activate by adding `?fps` to the URL: http://localhost:8080/?fps
 * Shows real-time FPS in top-right corner. Color-coded:
 *   green = 55-60+ fps (smooth)
 *   yellow = 30-55 fps (noticeable jank)
 *   red = <30 fps (severe lag)
 * Use this to precisely identify which sections cause drops.
 */
(function fpsHud() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("fps")) return;

  const hud = document.createElement("div");
  hud.style.cssText =
    "position:fixed;top:16px;right:16px;z-index:99999;" +
    "padding:6px 12px;font:bold 14px/1 monospace;" +
    "background:rgba(0,0,0,.85);color:#0f0;border-radius:6px;" +
    "border:1px solid #333;pointer-events:none;user-select:none;";
  hud.textContent = "-- fps";
  document.addEventListener("DOMContentLoaded", () => document.body.appendChild(hud));

  let frames = 0;
  let last = performance.now();
  function tick(now) {
    frames++;
    if (now - last >= 500) {
      const fps = Math.round((frames * 1000) / (now - last));
      hud.textContent = fps + " fps";
      hud.style.color = fps >= 55 ? "#0f0" : fps >= 30 ? "#fc0" : "#f33";
      frames = 0;
      last = now;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* Service worker — instant repeat visits + offline fallback.
 * Registered only on http(s); skipped on file:// to avoid noisy errors.
 *
 * Auto-update flow: when a new SW activates (e.g. after we bump VERSION),
 * we listen for the `controllerchange` event and force-reload the page
 * once so the user immediately sees the new content. This eliminates the
 * "user has to manually hard-reload after I push" cache-update lag. */
if (
  "serviceWorker" in navigator &&
  typeof location !== "undefined" &&
  /^https?:$/.test(location.protocol)
) {
  let reloadingOnce = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadingOnce) return;
    reloadingOnce = true;
    window.location.reload();
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js", { scope: "./" })
      .then((reg) => {
        /* If a new SW is waiting, ask it to take over immediately */
        if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", () => {
            if (sw.state === "installed" && navigator.serviceWorker.controller) {
              /* New SW installed alongside old one — take over now */
              sw.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch(() => {});
  });
}

/* ── Client-side state caching ──
 * Tiny perf wins from remembering session state across reloads:
 *  - Scroll position: browser already does this most of the time, but
 *    SPA-style content-visibility sections sometimes break it. We back up
 *    to sessionStorage as a safety net.
 *  - Visited-before flag: localStorage. Used to short-circuit one-time
 *    intro animations and prefer the cached SW assets immediately.
 *  - Prefers-reduced-motion: cached so we don't query matchMedia repeatedly.
 */
(function clientStateCache() {
  if (typeof sessionStorage === "undefined" || typeof localStorage === "undefined") return;

  /* Disable browser's automatic scroll restore — we'll handle it ourselves
   * after content-visibility sections have laid out. */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  /* Save scroll position before unloading (covers refresh + back/forward) */
  const KEY_SCROLL = "astarter_scroll_y";
  const KEY_VISITED = "astarter_visited";
  const KEY_VISIT_COUNT = "astarter_visits";

  /* Mark visit (used by other code to skip first-time inits) */
  try {
    localStorage.setItem(KEY_VISITED, "1");
    const n = parseInt(localStorage.getItem(KEY_VISIT_COUNT) || "0", 10);
    localStorage.setItem(KEY_VISIT_COUNT, String(n + 1));
  } catch (_) {}

  /* Restore scroll position once content has had a chance to lay out */
  const saved = sessionStorage.getItem(KEY_SCROLL);
  if (saved != null) {
    const y = parseInt(saved, 10);
    if (!isNaN(y) && y > 0) {
      /* Wait two rAFs so content-visibility sections have painted their
       * intrinsic-size before we scroll, otherwise we'd land in the wrong
       * place. */
      requestAnimationFrame(() =>
        requestAnimationFrame(() => window.scrollTo(0, y))
      );
    }
  }

  /* Throttled save — only writes once per ~500ms of scrolling */
  let saveTimer = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (saveTimer) return;
      saveTimer = setTimeout(() => {
        try { sessionStorage.setItem(KEY_SCROLL, String(window.scrollY | 0)); } catch (_) {}
        saveTimer = 0;
      }, 500);
    },
    { passive: true }
  );

  /* Also save on pagehide (covers tab close, refresh, back/forward cache) */
  window.addEventListener("pagehide", () => {
    try { sessionStorage.setItem(KEY_SCROLL, String(window.scrollY | 0)); } catch (_) {}
  });
})();

patchResolvedAssetUrls();
initNodesSplineViewer();
initSplineViewerPause();
initVideoA11y();

initAboxWhenVisible();

/* Critical inits — needed for first-paint UX */
initNav();
initReveal();
initNarrativeWords();
initAboxCopyReveal();
initAboxScroll();
initCenterSquare();
initRoadmap();

/* Non-critical inits — small setTimeout deferral so they don't compete
 * with first paint. Was using requestIdleCallback but Brave's idle
 * scheduler is conservative — sometimes never fires the callback, leaving
 * partner cards + news cards never built. setTimeout 50ms is reliable
 * across all Chromium browsers. */
setTimeout(() => {
  initTokenomics();
  initPartners();
}, 50);
setTimeout(() => {
  buildBlogCarousel();
  initNewsletter();
}, 50);
