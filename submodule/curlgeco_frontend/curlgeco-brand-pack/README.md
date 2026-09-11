# curlgeco Brand Pack

Primary logo assets for curlgeco, set in the typefaces the app actually ships.

- **Wordmark (text logo):** `curlgeco` — lowercase, Inter Tight **Bold (700)**, `-1.5%` tracking,
  two-tone: `curl` + `geco`
- **Symbol mark:** `{}` — JetBrains Mono **ExtraBold (800)** on a rounded tile
- **Every glyph is an outlined vector path.** No `<text>` element, no font on the
  render machine, no substitution. An SVG here looks identical everywhere.

> Replaces the retired `artifacts/brand/` (a single hand-drawn `curlgeco.logo.svg`
> that relied on an ivory chip to keep a black `curl` legible on dark surfaces).
> This pack is the single source of truth for curlgeco brand assets.

curlgeco is a UGECO product, and the identity is deliberately inherited: same
yellow, same ink, same logotype face, same tile geometry as
[`ugeco-brand-pack`](https://ugeco.in). What makes it curlgeco is the `{}` mark
and the mono face it is cut from.

---

## Typography — as used in the app

Loaded in [`src/app/layout.tsx`](../src/app/layout.tsx) via `next/font/google`,
exposed as CSS variables in [`src/app/globals.css`](../src/app/globals.css).

| Role | Typeface | Weights | CSS variable |
| --- | --- | --- | --- |
| Body **and headings** | **Inter Tight** | 400 · 500 · 600 · 700 · 800 | `--font-sans` |
| Mono / code / labels / the mark | **JetBrains Mono** | 400 · 500 · 600 · 700 | `--font-mono` |

Inter Tight is the logotype face, shared with UGECO. JetBrains Mono carries the
product's own character: it renders the `{}` mark, every endpoint URL, model id,
latency figure and streamed token in the UI. `font/` ships both variable TTFs
(wght axis) plus their SIL Open Font Licenses, so the marks rebuild offline.

```
Inter Tight      https://fonts.google.com/specimen/Inter+Tight
JetBrains Mono   https://fonts.google.com/specimen/JetBrains+Mono
Licence          SIL OFL 1.1 — bundled at font/OFL-InterTight.txt, font/OFL-JetBrainsMono.txt
```

## Colour

The identity is **one accent on neutral ink**. There is no secondary accent.

| Token | Hex | Use |
| --- | --- | --- |
| Yellow | `#facc15` | Primary accent; `geco` in the wordmark, the symbol tile |
| Ink | `#0b0b0e` | Base surface; the `{}` glyph on the yellow tile |
| White | `#ffffff` | `curl` in the wordmark on dark chrome |
| Grey | `#6b7280` | Muted wordmark |

### Product UI ramp

curlgeco is **dark only** — there is no light theme. These are the exact values
in `globals.css`; the neutrals are true neutrals, with **no warm or yellow tint**.
Yellow appears as an accent, never as a wash over a surface.

| Token | Value | Use |
| --- | --- | --- |
| `--cg-bg` | `#0b0b0e` | App background |
| `--cg-surface` | `#131317` | Panels, cards |
| `--cg-elevated` | `#1b1b21` | Inputs, popovers, hover states |
| `--cg-border` | `rgba(255,255,255,0.08)` | All borders — neutral, never tinted |
| `--cg-text` | `#f4f4f5` | Body text |
| `--cg-muted` | `rgba(244,244,245,0.62)` | Secondary text |
| `--cg-primary` | `#facc15` | Accent: links, active nav, focus rings |

> ⚠️ **Retired with this pack.** The previous palette tinted everything warm —
> ivory body text `#f8f3e6`, yellow-alpha borders `rgba(255,220,118,0.1)`, an
> amber secondary `#f59e0b`, and two large yellow radial gradients washed across
> the page background. Yellow is an accent now, not an atmosphere. The
> `[data-theme="light"]` block is gone with it.

---

## Contents

### `svg/` — masters
Wordmark artboards are cropped tight to the outline: **1060.72 × 256** (4.1434 : 1),
including the `g` descender and the `l` ascender. Symbol artboards are **512 × 512**.

| Wordmark (8) | `curl` | `geco` |
| --- | --- | --- |
| `curlgeco-wordmark.svg` | `#ffffff` | `#facc15` — **primary**, dark chrome |
| `curlgeco-wordmark-ink-yellow.svg` | `#0b0b0e` | `#facc15` — two-tone on warm neutrals |
| `curlgeco-wordmark-ink.svg` | `#0b0b0e` | `#0b0b0e` — light surfaces |
| `curlgeco-wordmark-white.svg` | `#ffffff` | `#ffffff` |
| `curlgeco-wordmark-yellow.svg` | `#facc15` | `#facc15` |
| `curlgeco-wordmark-black.svg` | `#000000` | `#000000` — pure-black print |
| `curlgeco-wordmark-grey.svg` | `#6b7280` | `#6b7280` — muted / partner walls |
| `curlgeco-wordmark-currentcolor.svg` | inherits CSS `color` | inherits |

| Symbol `{}` (9) | Tile | Glyph |
| --- | --- | --- |
| `brace-mark.svg` | `#facc15` | `#0b0b0e` — **primary**, matches the favicon |
| `brace-mark-ink.svg` | `#0b0b0e` | `#facc15` |
| `brace-mark-white.svg` | `#ffffff` | `#0b0b0e` — light surfaces |
| `brace-mark-mono-black.svg` | white | black |
| `brace-mark-mono-white.svg` | black | white |
| `brace-mark-transparent.svg` | — | `#facc15` |
| `brace-mark-transparent-ink.svg` | — | `#0b0b0e` |
| `brace-mark-transparent-white.svg` | — | `#ffffff` |
| `brace-mark-currentcolor.svg` | — | inherits CSS `color` |

### `png/` — raster
Transparent background throughout.

- Wordmark primary at **512 / 1024 / 2048 / 4096** px wide (`…-4096w.png` is the big logo)
- Wordmark ink · white · grey at 2048 px wide
- `brace-mark` at 16 · 32 · 64 · 128 · 180 · 192 · 256 · 512 · 1024 px
- `brace-mark-ink`, `brace-mark-white`, `brace-mark-transparent` at 512 · 1024 px

### `favicon/` — browser + app icons
`favicon.ico` (16/32/48) · `favicon.svg` (outlined) · `favicon-16x16.png` ·
`favicon-32x32.png` · `apple-touch-icon.png` (180) ·
`android-chrome-192x192.png` · `android-chrome-512x512.png` · `site.webmanifest`

### `font/`
`InterTight[wght].ttf` · `JetBrainsMono[wght].ttf` · both SIL OFLs

---

## Usage rules

**Clearspace** — keep free space equal to **25 % of the wordmark's height** on all
four sides; for the symbol, **12.5 % of the tile** (half the corner radius).

**Minimum size** — wordmark **96 px** wide on screen / 25 mm in print (it is a
long, 4.14 : 1 lockup — it dies smaller than that). Symbol **16 px**. Below the
wordmark minimum, use `brace-mark.svg`.

**The two-tone split is fixed.** `curl` and `geco` are one word cut in two
colours at a fixed point; never re-colour a different span, never insert a space,
a hyphen or a capital.

**Pairing** — yellow reads strongest on `#0b0b0e`. On white, prefer the ink or
grey wordmark — yellow on white fails contrast.

**Do not** re-set the logo in another typeface or weight, re-space the letters,
stretch either artboard non-uniformly, add effects, wash a yellow gradient behind
it, or place the yellow wordmark on a light background.

**Header and footer chrome stays wordmark-only** — do not pair the wordmark with
the symbol in site chrome. The `{}` mark is for favicon, titlebar, PWA, app-icon
and avatar surfaces, plus the single sidebar/footer lockup the app already ships.
That rule is why this pack has no horizontal lockup file.

## Web integration

Runtime copies live in [`../public/brand/`](../public/brand/); the favicon set is
served from [`../public/`](../public/). The app draws the mark and wordmark
through [`src/components/shared/BrandLogo.tsx`](../src/components/shared/BrandLogo.tsx),
which inlines the outlined paths so chrome needs no network round-trip and the
mark can inherit `currentColor`.

Because these artboards are tight-cropped, set **one** dimension and let the
other follow (`className="h-8 w-auto"`).

## Rebuilding

The pack is generated, not hand-drawn. Sources: `gen.py` (outlines → SVG),
`raster.py` (SVG → PNG/ICO), `glyphlib.py` (variable-font instancing, GPOS
kerning, outline extraction). Regenerate after any change to weight, tracking or
palette rather than editing the path data by hand.

```bash
cd curlgeco-brand-pack/src
python3 gen.py      # needs fonttools
python3 raster.py   # needs pillow + rsvg-convert
```
