"""Render PNG / ICO / favicon deliverables from the master SVGs."""
import os, subprocess
from PIL import Image

PACK = os.environ.get("PACK", os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SVG  = os.path.join(PACK, "svg")

def png(src, out, w=None, h=None):
    os.makedirs(os.path.dirname(out), exist_ok=True)
    cmd = ["rsvg-convert", os.path.join(SVG, src), "-o", out]
    if w: cmd += ["-w", str(w)]
    if h: cmd += ["-h", str(h)]
    subprocess.run(cmd, check=True)
    return out

made = []
# --- wordmark: sized by width, transparent background ---
for tone in ["", "-ink", "-white", "-grey"]:
    widths = [512, 1024, 2048, 4096] if tone == "" else [2048]
    for w in widths:
        made.append(png(f"curlgeco-wordmark{tone}.svg",
                        f"{PACK}/png/curlgeco-wordmark{tone}-{w}w.png", w=w))

# --- brace mark: square app-icon sizes ---
for variant in ["brace-mark", "brace-mark-ink", "brace-mark-white", "brace-mark-transparent"]:
    sizes = [16, 32, 64, 128, 180, 192, 256, 512, 1024] if variant == "brace-mark" else [512, 1024]
    for s in sizes:
        made.append(png(f"{variant}.svg", f"{PACK}/png/{variant}-{s}.png", w=s, h=s))

# --- favicon set ---
fav = f"{PACK}/favicon"
for s in (16, 32, 48, 180, 192, 512):
    png("brace-mark.svg", f"{fav}/_tmp-{s}.png", w=s, h=s)
Image.open(f"{fav}/_tmp-48.png").save(
    f"{fav}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
os.rename(f"{fav}/_tmp-16.png",  f"{fav}/favicon-16x16.png")
os.rename(f"{fav}/_tmp-32.png",  f"{fav}/favicon-32x32.png")
os.rename(f"{fav}/_tmp-180.png", f"{fav}/apple-touch-icon.png")
os.rename(f"{fav}/_tmp-192.png", f"{fav}/android-chrome-192x192.png")
os.rename(f"{fav}/_tmp-512.png", f"{fav}/android-chrome-512x512.png")
os.remove(f"{fav}/_tmp-48.png")

# compact favicon.svg (outlined - no font dependency at render time)
src = open(f"{SVG}/brace-mark.svg").read()
body = src[src.index("<svg"):]
body = body.replace(' width="512" height="512"', "", 1)
open(f"{fav}/favicon.svg", "w").write(body)

open(f"{fav}/site.webmanifest", "w").write("""{
  "name": "curlgeco",
  "short_name": "curlgeco",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "theme_color": "#facc15",
  "background_color": "#0b0b0e",
  "display": "standalone"
}
""")
print(f"{len(made)} png rendered + favicon set")
