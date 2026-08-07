# Smell Report — Hypixel Achievements

Mode: `/design smell` · Date: 2026-08-07
Score: **6/10 — PRESENT**

## Verdict

The surface is a hand-crafted Minecraft-pixel design system, not a generated template. The dominant smells are not purple gradients or glassmorphism — those are absent. The real tells are smaller and localized: emoji standing in for icons, a centered landing that leans on a chip cloud instead of a decision, and Inter as an unchosen body default.

## Evidence Bar

Every finding below is tied to an observed file and pattern. No invented odors.

## TL;DR

The strongest visual idea — hard beveled panels, pixel font, Hypixel-semantic colors — belongs to this product. The generic residue is concentrated in iconography (emoji), the home page composition (centered chip cloud), and the body type (Inter with no stated reason). The fix is targeted, not a redesign.

---

## Heuristic Scores

| # | Heuristic | Score | Key Finding |
|---|---|---|---|
| 1 | Tech gradient | 1 | No gradients anywhere. All flat fills. |
| 2 | Generic tech hue | 1 | Palette is Hypixel-semantic, not blue-violet. |
| 3 | Feature tile grid | 1 | No marketing tile grids. Data grids only. |
| 4 | Accent rail | 1 | Rails are semantic (type/status coding), not decoration. |
| 5 | Unearned blur | 1 | No glassmorphism. Bevels, not blur. |
| 6 | Stat monument | 1 | Numbers are modest (text-sm/lg). No oversized stats. |
| 7 | Icon topper | 1 | No emblem-above-heading pattern. |
| 8 | Bounce everywhere | 0 | `animate-bounce` in Loading + pulsing dots; also emoji-as-icon in nav/filters/empty states (placeholder energy). |
| 9 | Default type | 0 | Inter body font with no stated reason; pixel font is earned, Inter is not. |
| 10 | Center stack | 0 | Home page is centered chip cloud + search; data pages are fine. |

**Total: 6/10** (3 tells detected)

---

## Priority Issues

### P1 — Emoji as iconography

**Reflex**: The fastest way to fake an icon set is to paste an emoji. It reads as placeholder — the designer never decided what the icon actually is.

**Evidence**:
- `components/layout/PlayerNav.tsx:29,42,55` — `🏆 Achievements`, `📊 Breakdown`, `📜 Quests` in the primary section nav
- `components/achievements/AchievementFilters.tsx:76` — `🔍` search affordance
- `components/quests/QuestFilters.tsx:81` — `🔍` search affordance
- `components/achievements/AchievementTables.tsx:447` — `📭` empty state
- `components/quests/QuestCard.tsx:128` — `✓` checkmark in a pixel square
- `components/player/PlayerBadge.tsx:16` — `❤️MOMMY❤️` special badge

The nav tabs are the most visible. The Minecraft aesthetic elsewhere uses real pixel-art icons (`PixelImg` with `image-rendering: pixelated`); emoji break that system — different rendering, no hard border, no bevel.

**Fix**: Replace nav emoji with inline SVG pixel icons that match the pixel-art language. Replace the search magnifier and empty-state mailbox with pixel-style SVGs. The `✓` and heart badge are content, not chrome — the heart badge is Hypixel's actual tag, keep it.

---

### P2 — Home page centered chip cloud

**Reflex**: A centered landing with a search box and a cloud of evenly-weighted game chips is the "we have games" default. It lists the catalog but makes no decision about what the user should do first.

**Evidence**: `app/page.tsx` — `PlayerSearch` block, centered tagline, ~70 equal game chips, one Compare CTA. All elements are equal weight; nothing prioritizes.

**Fix**: Keep the search as the primary action (it is the actual job — look up a player). Give the game catalog a purpose: make it the game picker that feeds the search, or rank the most-played games first, or group by category. The composition should be a decision surface, not a static list.

---

### P3 — Inter as unchosen body type

**Reflex**: Inter appears when no type decision was made. It is not wrong by itself, but here it has no stated reason and no scale system.

**Evidence**: `app/layout.tsx` loads Inter via `next/font/google`; `globals.css` sets `--font-sans: var(--font-body)`. Body copy is Inter at default sizes. The pixel font carries all the voice; Inter carries the filler.

**Fix**: Either commit to Inter with a tuned scale (headings already use the pixel font, so Inter only serves long-form descriptions — that is a defensible job), or replace it with a system font stack that matches the blocky, readable, video-game utility register. The real fix is a deliberate body scale, not a font swap.

---

## What's Working (no change needed)

- **Bevel-and-shadow depth system** (`BlockPanel`, `PixelButton`) — a real pixel-art depth analog, consistent everywhere.
- **Hypixel-semantic palette** — grass/gold/sky/red/dirt, not blue-violet. Earned hue.
- **Semantic accent rails** — quest type rails (gold/sky/purple) and completed-row rails encode state; they are not decoration.
- **Two-column data explorer** on achievements/quests pages — a proper scan surface.
- **Pixel font with glyph metrics** (`lib/font/minecraft-metrics.ts`) — a genuinely bespoke detail.
- **Error/rate-limit panels** — full recovery paths, no dead ends.

---

## Next Modes

- `deslop` — apply the fixes: replace emoji with pixel SVG icons, rework home composition, tune body type.
- `interaction` — add focus-visible rings to nav/links/cards (currently only inputs have focus styles).
- `finish` — final polish after deslop.

---

## How I Know Smell Is Gone

- No emoji in chrome; all icons are pixel-art SVGs.
- The home page has a decision hierarchy, not a static catalog.
- Inter has a stated job and scale, or a deliberate replacement.
- A stranger could not guess this was assembled from defaults.
