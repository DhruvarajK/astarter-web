"""
Astarter — production-style static file server with proper HTTP cache headers.

Why this exists:
  Python's built-in http.server sends NO Cache-Control, so the browser
  revalidates every asset (304 round-trip) on every page load. On the real
  server you'd configure nginx; this script mimics that locally so caching
  behaviour matches production.

Cache strategy (mirrors typical CDN config):
  - HTML / sw.js / manifest:    no-cache (always check freshness)
  - Fingerprinted assets:       immutable, max-age=1 year (1 year cache)
  - Images / video / fonts:     max-age=30 days (refreshable)
  - Default fallback:           max-age=1 hour
  - Service worker:             no-cache mandatory (browser spec)

Run:
  python cached_server.py 8080
"""
import http.server
import socketserver
import sys
import os
import re
import mimetypes
from pathlib import Path

mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("application/manifest+json", ".webmanifest")
mimetypes.add_type("model/gltf-binary", ".glb")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("font/ttf", ".ttf")
mimetypes.add_type("font/woff", ".woff")
mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("font/otf", ".otf")

YEAR = 60 * 60 * 24 * 365
MONTH = 60 * 60 * 24 * 30
HOUR = 60 * 60

FINGERPRINTED = re.compile(r"-[A-Za-z0-9_]{6,}\.(js|css|png|jpg|jpeg|webp|svg|woff2)$")


class CachedHandler(http.server.SimpleHTTPRequestHandler):
    # Disable directory indexing — without this, http://localhost:8080/assets/
    # would expose a directory listing of every file in assets/.
    def list_directory(self, path):
        self.send_error(403, "Directory listing is disabled")
        return None

    def end_headers(self):
        path = self.path.split("?")[0].split("#")[0]
        name = path.rsplit("/", 1)[-1].lower()
        ext = os.path.splitext(name)[1]

        # Service worker MUST NOT be cached (browser spec)
        if name == "sw.js":
            self.send_header("Cache-Control", "no-cache, must-revalidate")
            self.send_header("Service-Worker-Allowed", "/")
        # HTML, manifest, robots, sitemap = always revalidate
        elif ext in (".html", ".webmanifest", ".xml", ".txt") or path in ("/", ""):
            self.send_header("Cache-Control", "no-cache, must-revalidate")
        # Fingerprinted assets (Vite-style hash in filename) = 1 year
        elif FINGERPRINTED.search(name):
            self.send_header("Cache-Control", f"public, max-age={YEAR}, immutable")
        # Images / video / fonts / 3D models = 30 days
        elif ext in (".webp", ".png", ".jpg", ".jpeg", ".gif", ".mp4", ".webm",
                     ".woff", ".woff2", ".ttf", ".svg", ".glb"):
            self.send_header("Cache-Control", f"public, max-age={MONTH}")
        # JS/CSS without fingerprint = 1 hour (might change between deploys)
        elif ext in (".js", ".css"):
            self.send_header("Cache-Control", f"public, max-age={HOUR}, must-revalidate")
        # Default = 1 hour
        else:
            self.send_header("Cache-Control", f"public, max-age={HOUR}")

        # Security headers — mirror what a CDN/reverse-proxy should send in prod
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Permissions-Policy",
                         "geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()")
        # CSP matches the meta-tag in index.html (defense-in-depth — header
        # takes effect earlier than the meta tag during HTML parsing).
        # Skip for sw.js because Chromium rejects SWs that don't pass their
        # own response through unmodified.
        if name != "sw.js":
            self.send_header(
                "Content-Security-Policy",
                "default-src 'self'; "
                # 'wasm-unsafe-eval' lets DRACO (compressed glTF) decoder run —
                # without it, ABOX 3D model can't decode and the section renders empty.
                "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; "
                # Spline viewer + DRACO both spawn Web Workers; blob: covers inline-worker URLs.
                "worker-src 'self' blob: https://cdn.jsdelivr.net https://unpkg.com; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: blob: https://cdn.jsdelivr.net; "
                "font-src 'self'; "
                # blob: is needed in connect-src for Three.js binary texture/buffer XHRs.
                "connect-src 'self' blob: https://prod.spline.design https://dl.polyhaven.org https://cdn.jsdelivr.net https://unpkg.com; "
                "frame-ancestors 'none'; "
                "base-uri 'self'; "
                "form-action 'self'; "
                "object-src 'none'"
            )
        super().end_headers()


class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    """Threaded variant — each request runs on its own thread.
    A single client aborting mid-transfer (WinError 10053) can no longer
    wedge the request queue and stall every other resource."""
    daemon_threads = True       # threads exit when main process does
    allow_reuse_address = True  # restart cleanly after Ctrl+C


def run(port=8080, host="127.0.0.1"):
    os.chdir(Path(__file__).parent)
    with ThreadingHTTPServer((host, port), CachedHandler) as httpd:
        bind_label = "localhost" if host == "127.0.0.1" else host
        print(f"Astarter cached server (threaded) running at http://{bind_label}:{port}/")
        print(f"Bound to {host} (use --host 0.0.0.0 to expose to your LAN — only do this for mobile testing).")
        print("HTTP cache headers + CSP active. Directory listing disabled.")
        print("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down...")


if __name__ == "__main__":
    # Simple CLI: python cached_server.py [PORT] [--host HOST]
    args = sys.argv[1:]
    host = "127.0.0.1"
    if "--host" in args:
        i = args.index("--host")
        host = args[i + 1]
        del args[i:i + 2]
    port = int(args[0]) if args else 8080
    run(port=port, host=host)
