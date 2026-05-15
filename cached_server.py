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

        # Security & performance headers
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        # Allow service worker installation from /
        if name == "sw.js":
            pass  # handled above
        super().end_headers()


class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    """Threaded variant — each request runs on its own thread.
    A single client aborting mid-transfer (WinError 10053) can no longer
    wedge the request queue and stall every other resource."""
    daemon_threads = True       # threads exit when main process does
    allow_reuse_address = True  # restart cleanly after Ctrl+C


def run(port=8080):
    os.chdir(Path(__file__).parent)
    with ThreadingHTTPServer(("", port), CachedHandler) as httpd:
        print(f"Astarter cached server (threaded) running at http://localhost:{port}/")
        print("HTTP cache headers active — repeat visits will be near-instant.")
        print("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down...")


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    run(port)
