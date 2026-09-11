"""Generate the curlgeco brand pack: outlined SVG logos.

Wordmark  -> Inter Tight (the UGECO logotype face; curlgeco is a UGECO product)
Brace mark -> JetBrains Mono (the product's own mono face)
"""
import os
from fontTools.misc.transform import Transform
import glyphlib as g

OUT = os.environ.get("PACK", os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

# --- Brand palette (mirrors curlgeco-brand-pack/README.md and globals.css) ---
YELLOW = "#facc15"
INK    = "#0b0b0e"
WHITE  = "#ffffff"
BLACK  = "#000000"
GREY   = "#6b7280"

WORDMARK_WEIGHT = 700     # Bold — same as the UGECO wordmark
MARK_WEIGHT     = 800     # ExtraBold braces; lighter weights blur shut at 16px
TRACKING        = -0.015  # em; Inter Tight display tracking
MASTER_H        = 256.0   # wordmark master artboard height (svg units)
SPLIT           = 4       # "curl" | "geco"

HDR = '<?xml version="1.0" encoding="UTF-8"?>\n'


def _svg(w, h, body, label):
    return (
        f'{HDR}<svg xmlns="http://www.w3.org/2000/svg" width="{w:g}" height="{h:g}" '
        f'viewBox="0 0 {w:g} {h:g}" role="img" aria-label="{label}">\n'
        f'  <title>{label}</title>\n{body}</svg>\n'
    )


def write(rel, content):
    p = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w") as fh:
        fh.write(content)
    return rel, len(content)


# ---------------------------------------------------------------- wordmark
# One layout, two fills: "curl" and "geco" share a transform so they stay
# on the same baseline and keep their true kerned spacing.
recs, _ = g.layout("curlgeco", WORDMARK_WEIGHT, TRACKING)
x0, y0, x1, y1 = g.bounds(recs)
s = MASTER_H / (y1 - y0)
W = round((x1 - x0) * s, 2)
H = round(MASTER_H, 2)
T = Transform().translate(-x0 * s, y1 * s).scale(s, -s)
CURL_PATH = g.to_svg_path(recs[:SPLIT], T)
GECO_PATH = g.to_svg_path(recs[SPLIT:], T)
print(f"wordmark  {W} x {H}  (ratio {W/H:.4f})  curl {len(CURL_PATH)}B  geco {len(GECO_PATH)}B")


def wordmark(curl_fill, geco_fill):
    return _svg(
        W, H,
        f'  <path fill="{curl_fill}" d="{CURL_PATH}"/>\n'
        f'  <path fill="{geco_fill}" d="{GECO_PATH}"/>\n',
        "curlgeco",
    )


for name, curl_fill, geco_fill in [
    ("curlgeco-wordmark",              WHITE,          YELLOW),  # primary — dark chrome
    ("curlgeco-wordmark-ink-yellow",   INK,            YELLOW),  # two-tone on warm neutrals
    ("curlgeco-wordmark-ink",          INK,            INK),     # light surfaces
    ("curlgeco-wordmark-white",        WHITE,          WHITE),
    ("curlgeco-wordmark-yellow",       YELLOW,         YELLOW),
    ("curlgeco-wordmark-black",        BLACK,          BLACK),   # pure-black print
    ("curlgeco-wordmark-grey",         GREY,           GREY),    # muted / partner walls
    ("curlgeco-wordmark-currentcolor", "currentColor", "currentColor"),
]:
    write(f"svg/{name}.svg", wordmark(curl_fill, geco_fill))

# ------------------------------------------------------------- brace mark
# 512 artboard; corner radius 21.875% carries over from the UGECO symbol tile
# so the two products' app icons sit together as a family. Braces need a taller
# glyph ratio than a letter mark: at 0.46 the two braces blur into one blob at
# 16px, at 0.72 they crowd the clearspace. 0.64 holds both ends.
TILE, RADIUS, GLYPH_RATIO = 512.0, 112.0, 0.64

mrecs, _ = g.layout("{}", MARK_WEIGHT, 0.0, g.JETBRAINS_MONO)
mx0, my0, mx1, my1 = g.bounds(mrecs)
gh = TILE * GLYPH_RATIO
ms = gh / (my1 - my0)
gw = (mx1 - mx0) * ms
# optically centre the glyph's true bounding box on the tile
tx = (TILE - gw) / 2 - mx0 * ms
ty = (TILE + gh) / 2 + my0 * ms
MARK_PATH = g.to_svg_path(mrecs, Transform().translate(tx, ty).scale(ms, -ms))
print(f"brace mark  glyph {gw:.1f} x {gh:.1f} on {TILE:g} tile  path {len(MARK_PATH)}B")


def mark(tile, glyph):
    body = ""
    if tile:
        body += (f'  <rect width="{TILE:g}" height="{TILE:g}" '
                 f'rx="{RADIUS:g}" ry="{RADIUS:g}" fill="{tile}"/>\n')
    body += f'  <path fill="{glyph}" d="{MARK_PATH}"/>\n'
    return _svg(TILE, TILE, body, "curlgeco")


for name, tile, glyph in [
    ("brace-mark",                    YELLOW, INK),    # primary — matches the favicon
    ("brace-mark-ink",                INK,    YELLOW),
    ("brace-mark-white",              WHITE,  INK),
    ("brace-mark-mono-black",         WHITE,  BLACK),
    ("brace-mark-mono-white",         BLACK,  WHITE),
    ("brace-mark-transparent",        None,   YELLOW),
    ("brace-mark-transparent-ink",    None,   INK),
    ("brace-mark-transparent-white",  None,   WHITE),
    ("brace-mark-currentcolor",       None,   "currentColor"),
]:
    write(f"svg/{name}.svg", mark(tile, glyph))

print("svg files:", len(os.listdir(os.path.join(OUT, "svg"))))
