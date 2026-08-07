# Checkup Report — Hypixel Achievements

Mode: `/design checkup` · Date: 2026-08-07
Score: **45/60 — FIT TO SHIP WITH FIXES**

## Verdict

This is a healthy, deliberately-authored surface. The core task (look up a player, browse achievements, compare players) is completable with real controls. The weaknesses are access-related: focus visibility beyond inputs, color-only status encoding, no reduced-motion path, and an unsettled body type scale. None of these block the product, but all four deserve a pass before polish.

## Evidence Bar

Every vital is backed by observed code. Where I could not verify a claim (e.g., actual colorblind simulation), I say so and mark it.

## TL;DR

The composition matches the work: an explore surface with search, filters, results, and return paths. The pixel-art visual language is consistent and earned. The main risks are keyboard focus visibility, color-only status cues, motion without a reduced-motion fallback, and mobile filter UX.

---

## Vital Signs

| # | Vital | Score | Status | Key Finding |
|---|---|---|---|---|
| 1 | Intentionality | 10 | Healthy | Cohesive Minecraft-pixel system; every pattern earned. |
| 2 | Readability | 5 | Watch | Inter body has no scale; tiny 0.5-0.7rem pixel labels strain at small sizes. |
| 3 | Usability | 10 | Healthy | Search, filters, sort, compare all functional with real controls. |
| 4 | Responsiveness | 5 | Watch | Mobile filter toggle works but is a second tap; virtualized tables adapt. |
| 5 | Speed | 10 | Healthy | Server-rendered, cached, virtualized tables, pixelated images, no jank. |
| 6 | Accessibility | 5 | Watch | Focus rings only on inputs; color-only status; no reduced-motion fallback. |

**Total: 45/60**

---

## Priority Findings

### P1 — Focus visibility beyond inputs

**Evidence**: `AchievementFilters.tsx:85` and `QuestFilters.tsx:90` have `focus:ring-2 focus:ring-mc-sky/30`. Nothing else does — `PlayerNav.tsx` tabs, `SiteHeader.tsx` links, `CollapsibleSection.tsx` header button, `PixelButton` all rely on the browser default outline, which is invisible against dark backgrounds for many users.

**Why it matters**: Keyboard users tabbing through the nav and filters get no visible cue. The primary browse path starts at the nav tabs.

**Fix**: Add a consistent focus-visible ring (e.g., `focus-visible:ring-2 focus-visible:ring-mc-sky/60 focus-visible:outline-none`) to nav links, tab links, buttons, and the collapsible header. One shared pattern, applied everywhere. This is the `interaction` discipline.

---

### P2 — Color-only status encoding

**Evidence**: Quest status is `bg-mc-sky` (active) / `bg-mc-grass` (completed) / `bg-mc-stone` (available) — color dots and colored rails, no shape or text duplication in some places. Unlock percent is sky/gold/stone color only. In the achievements table, completed rows get a grass left rail; the text label is only `✓ Done` in the mobile variant, not the desktop table.

**Why it matters**: Deuteranope/protanope users can lose the grass/sky distinction entirely. The completed-vs-available signal is the core task.

**Fix**: Add a non-color cue alongside the dot/rail — e.g., a filled vs. hollow square, or a check glyph — and verify under a colorblind simulation. The desktop table's completed rows should get a visible ✓ like the mobile cards have.

---

### P3 — Motion without reduced-motion fallback

**Evidence**: `Loading.tsx` uses `animate-bounce` + `animate-pulse`. No `prefers-reduced-motion` guard exists anywhere.

**Why it matters**: Vestibular users see bouncing squares and pulsing dots. The loading state is exactly when the user is already waiting.

**Fix**: Wrap the bounce in `motion-reduce:animate-none` and the pulse in `motion-reduce:animate-none`, so reduced-motion users get a static indicator.

---

### P4 — Body type scale unsettled

**Evidence**: Inter is loaded as the body font with no scale tokens. Pixel labels run 0.5rem–0.7rem; the body text is default Inter. The extremes (0.5rem reward labels, 0.65rem chips) are below comfortable reading size.

**Why it matters**: On a data-heavy surface, the description text is the actual content. Sub-0.7rem pixel text is decorative-sized.

**Fix**: Settle the body scale: one readable size for descriptions (14–16px), and allow only the pixel font to run small in chrome/labels — or raise the tiny pixel labels to a legible floor. This is the `typeset` discipline.

---

### P5 (Watch) — Mobile filter flow

**Evidence**: On mobile, the filters are behind a "Filters" toggle (`AchievementFilters.tsx`), and the search input shows always. This is a reasonable pattern, but the toggle is a second tap for a core task (filtering by status).

**Why it matters**: Mobile users browse achievements with search+filters as the primary path. Extra taps add friction.

**Fix**: Keep the toggle (it is correct for density) but ensure the active-filter dot is obvious and the panel opens near the thumb. Watch it in the `responsive` pass.

---

## Prescriptions

- **Accessibility** → `interaction` mode: focus-visible rings everywhere, non-color status cues, reduced-motion fallbacks.
- **Readability** → `typeset` mode: body scale with a legible floor.
- **Responsiveness** → `responsive` mode: verify 320–2560px, container behavior, and the mobile filter flow.

## What's Working (verified)

- **Composition matches work** — explorer two-column layout, compare split view, breakdown grid. Search, filters, results, return paths all present.
- **Server-rendered + cached** — `"use cache"`, TanStack virtualizer, pixelated images. No layout shift observed in code.
- **Recovery paths** — `ErrorPanel`, `RateLimitPanel` with retry and home escapes, digest IDs.
- **Semantic color** — the palette is earned from Hypixel itself; not generic.
- **16px+ form inputs** — all `input`/`select` elements use `text-sm`+ (≥14px) with no iOS zoom trap; the search input is `text-sm` at 14px which is below the 16px iOS zoom threshold — flag for the responsive pass.

## How I Know Checkup Is Done

- Each vital is scored from observed code, not vibes.
- The core task (browse + compare) was traced end to end.
- Critical issues carry direct prescriptions.
- The surface is fit to ship, with four focused fixes queued.
