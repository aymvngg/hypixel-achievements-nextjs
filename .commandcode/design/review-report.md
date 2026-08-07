# Review Report — Hypixel Achievements

Mode: `/design review` · Date: 2026-08-07
Score: **35/50 — SOLID, FOCUSED INTERVENTION**

## Verdict

The interface has a real point of view: a Minecraft/Hypixel pixel-art instrument. It is one of the rare surfaces where the visual language is the product's own. The critique is not about identity — it is about execution at the edges: emoji breaking the icon system, body type without a scale, color-only status cues, and a home page that does not commit.

## First Impression

A dark, hard-edged, beveled pixel interface with a gold pixel-font wordmark. It reads as a game instrument immediately — before reading a word, the category (Hypixel achievements tracker) is visible. The bevel-and-shadow depth system gives every panel mass. This is a surface with a point of view.

## The Experience Lens (walking the flow)

**Arrival**: The home page offers a search box, a tagline, and a cloud of ~70 game chips. The search is the promise — "look up a player."

**Choice**: The user types a name, hits Go. The system responds with a player header, section nav (Achievements / Breakdown / Quests), and a summary strip.

**Browse**: The achievements explorer is a two-column surface: game sidebar + searchable, filterable, sortable table. This is the right work shape. Completed rows get a grass rail; tiers and rewards are readable.

**Compare**: Two player columns, gold VS, per-game win/loss. The compare summary is clean and the win state is unambiguous (grass text + border).

**Recovery**: Rate-limit and error panels give retry + home escapes with a digest ID.

**Where the story breaks**: The mobile filter toggle adds a tap; color-only status cues are lost to colorblind users; focus is invisible on nav tabs; the loading state bounces without a reduced-motion guard; and the home page's 70 equal chips are a catalog, not a decision.

---

## Design Lenses

| # | Lens | Score | Key Finding |
|---|---|---|---|
| 1 | First impression | 8 | Category and identity visible instantly; a real point of view. |
| 2 | Hierarchy | 7 | Data pages excellent; home page lists instead of deciding. |
| 3 | Color voice | 7 | Hypixel-semantic and earned; but status cues are color-only in places. |
| 4 | Type voice | 6 | Pixel font carries voice; Inter body has no scale; tiny labels strain. |
| 5 | Interaction feel | 7 | Real controls and recovery; focus, reduced-motion, and mobile filters lag. |

**Total: 35/50**

---

## Lens Detail

### First impression — 8/10

The strongest first impression in the codebase: a gold pixel wordmark, hard beveled panels, and a Minecraft palette. A stranger can name the category in two seconds. Nothing generic here.

**What would move it to 9**: The home page needs a composition that commits — make the game cloud a picker that feeds search, or lead with a ranked "popular games" lane. The arrival should feel like an instrument, not a list.

### Hierarchy — 7/10

The data pages are exemplary: sticky game sidebar, filter bar, summary strip, virtualized tables, collapsible tiered sections. Priority is encoded through rails, colors, and counts. The home page is the weak point — every chip weighs the same, and the single CTA (Compare) sits below a wall of chips.

**What would move it to 8**: Give the home page three levels: search as the primary decision, a small set of most-popular games, then the full catalog as a collapsed/scrollable lane.

### Color voice — 7/10

Grass green, gold, sky, red, dirt — the palette is Hypixel's own, earned and consistent. No generic tech hue, no gradient reflex. But quest status and unlock-percent are communicated by hue alone in several places; grass vs sky is exactly the pair deuteranopes lose. The purple (#9b59b6) used for Monthly quests is the one token that reads slightly off-palette (a soft violet among hard MC colors) — a candidate for a more saturated, dirt-like purple.

**What would move it to 8**: Non-color status cues (check glyph, filled vs hollow) plus a colorblind simulation pass; tighten the Monthly purple toward the MC palette.

### Type voice — 6/10

The pixel font is the hero and it earns it: uppercase, tracked, small, blocky — it makes the whole surface read as a game. The `+` glyph raising fix (`lib/font/minecraft-metrics.ts`) is genuinely bespoke. But Inter body has no scale system, and the 0.5–0.7rem pixel labels sit below comfortable reading size. The body descriptions (the actual content) are undirected Inter.

**What would move it to 7**: A deliberate body scale — 14–16px for descriptions, a legible floor for the smallest pixel labels, and Inter given the job of long-form only.

### Interaction feel — 7/10

Real interaction design: debounced search prefetch, `/` keyboard shortcut, sortable headers with aria-sort, collapsible sections with session persistence, status dots, active-filter notification, error digests, rate-limit countdowns. The gaps: focus-visible rings exist only on filter inputs; loading bounce/pulse ignores reduced motion; mobile filters add a tap; and the search input is 14px (iOS zoom threshold).

**What would move it to 8**: One shared focus-visible ring pattern, reduced-motion guards, non-color status cues, and 16px mobile inputs.

---

## Smell Lens

This is not a generated surface. The dominant tells are localized: emoji-as-icon in nav/filters/empty state (breaks the pixel-art system), the centered home chip cloud (no decision), and Inter as an unchosen body default. These are documented in `smell-report.md` with scores. The design's strong identity means the smells are cleanup, not rework.

---

## What I Recommend (ordered by impact)

1. **`interaction`** — Focus-visible rings everywhere; non-color status cues; reduced-motion fallbacks. Highest impact for real users, lowest effort.
2. **`deslop`** — Replace chrome emoji with pixel SVG icons; rework home composition; commit body type. The identity is right; these are the residue.
3. **`typeset`** — Body scale with a legible floor; settle Inter's job.
4. **`responsive`** — Mobile filter flow and 16px input floor.
5. **`finish`** — Final pass after the above.

## How I Know Review Is Done

- The first impression is named (game instrument, category visible instantly).
- The primary flow (search → browse → compare → recover) was walked end to end.
- Top issues are ordered by impact and mapped to modes.
- Smells are called out with evidence.
- Scores are explained with concrete moves that would raise them.
