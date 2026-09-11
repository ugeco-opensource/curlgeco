"""Extract outlined glyph paths from a variable font at a given weight.

Adapted from the UGECO brand pack so curlgeco can outline two faces:
Inter Tight for the wordmark, JetBrains Mono for the brace mark.
"""
import os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.misc.transform import Transform

FONT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "font")
INTER_TIGHT = os.path.join(FONT_DIR, "InterTight[wght].ttf")
JETBRAINS_MONO = os.path.join(FONT_DIR, "JetBrainsMono[wght].ttf")

_cache = {}


def instance(weight, src=INTER_TIGHT):
    key = (src, weight)
    if key not in _cache:
        _cache[key] = instantiateVariableFont(
            TTFont(src), {"wght": weight}, updateFontNames=False
        )
    return _cache[key]


def _kern_pairs(font):
    """Flat dict of (left, right) -> x-advance adjustment from GPOS PairPos."""
    pairs = {}
    if "GPOS" not in font:
        return pairs
    for lookup in font["GPOS"].table.LookupList.Lookup:
        for sub in lookup.SubTable:
            if getattr(sub, "LookupType", None) == 9 and hasattr(sub, "ExtSubTable"):
                sub = sub.ExtSubTable
            fmt = getattr(sub, "Format", None)
            if not hasattr(sub, "Coverage"):
                continue
            if fmt == 1 and hasattr(sub, "PairSet"):
                for gl, ps in zip(sub.Coverage.glyphs, sub.PairSet):
                    for rec in ps.PairValueRecord:
                        v = getattr(rec.Value1, "XAdvance", 0) or 0
                        if v:
                            pairs[(gl, rec.SecondGlyph)] = v
            elif fmt == 2 and hasattr(sub, "Class1Record"):
                c1 = getattr(sub.ClassDef1, "classDefs", {})
                c2 = getattr(sub.ClassDef2, "classDefs", {})
                for gl in sub.Coverage.glyphs:
                    k1 = c1.get(gl, 0)
                    if k1 >= len(sub.Class1Record):
                        continue
                    rec1 = sub.Class1Record[k1]
                    for g2, k2 in c2.items():
                        if k2 >= len(rec1.Class2Record):
                            continue
                        val = rec1.Class2Record[k2].Value1
                        v = getattr(val, "XAdvance", 0) or 0
                        if v:
                            pairs[(gl, g2)] = v
    return pairs


def layout(text, weight, tracking=0.0, src=INTER_TIGHT):
    """Lay out `text` in font units. tracking is in em fractions.

    Returns (recordings, advance_width) where recordings are RecordingPens
    already translated to their pen position, in font units, Y-up. One
    recording per character, so runs can be split and filled separately.
    """
    font = instance(weight, src)
    upem = font["head"].unitsPerEm
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    gs = font.getGlyphSet()
    kern = _kern_pairs(font)
    track = tracking * upem

    names = [cmap[ord(ch)] for ch in text]
    out, x = [], 0.0
    for i, gname in enumerate(names):
        rec = RecordingPen()
        gs[gname].draw(TransformPen(rec, Transform().translate(x, 0)))
        out.append(rec)
        x += hmtx[gname][0] + track
        if i + 1 < len(names):
            x += kern.get((gname, names[i + 1]), 0)
    if names:
        x -= track  # no trailing tracking
    return out, x


def bounds(recs):
    bp = BoundsPen(None)
    for r in recs:
        r.replay(bp)
    return bp.bounds  # (xMin, yMin, xMax, yMax) in font units, Y-up


def to_svg_path(recs, transform, decimals=2):
    """Replay recordings through `transform` into an SVG path string."""
    pen = SVGPathPen(None, ntos=lambda v: f"{v:.{decimals}f}".rstrip("0").rstrip("."))
    for r in recs:
        r.replay(TransformPen(pen, transform))
    return pen.getCommands()
