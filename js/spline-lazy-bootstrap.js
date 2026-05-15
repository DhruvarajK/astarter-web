/**
 * 首屏不拉 @splinetool/viewer（体积大），快滚到 Nodes 再动态 import。
 */
const SPLINE_VIEWER_MODULE =
  "https://unpkg.com/@splinetool/viewer@1.12.69/build/spline-viewer.js";

function loadSplineViewerModule() {
  if (window.__astarterSplineImport) return window.__astarterSplineImport;
  window.__astarterSplineImport = import(SPLINE_VIEWER_MODULE).catch(() => {});
  return window.__astarterSplineImport;
}

const sec = document.getElementById("nodes-section");
const eager =
  typeof window !== "undefined" &&
  window.ASTARTER_CONFIG &&
  window.ASTARTER_CONFIG.eagerLoadSpline;

if (eager || !sec || typeof IntersectionObserver === "undefined") {
  loadSplineViewerModule();
} else {
  const vh = window.innerHeight || 700;
  const r = sec.getBoundingClientRect();
  if (r.top < vh + 520 && r.bottom > -240) {
    loadSplineViewerModule();
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          loadSplineViewerModule();
          io.disconnect();
        }
      },
      { rootMargin: "480px 0px", threshold: 0 }
    );
    io.observe(sec);
  }
}
