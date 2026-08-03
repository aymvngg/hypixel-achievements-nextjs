# Hypixel Achievements (Web)

Web version of the Hypixel achievements Discord bot. Browse player achievements, view per-game AP breakdowns, and compare two players.

## Setup

1. Copy `.env.example` to `.env.local` and set your Hypixel API key:

```bash
cp .env.example .env.local
```

2. Install dependencies and run the dev server:

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server |
| `bun build` | Production build |
| `bun start` | Start production server |
| `bun test` | Run unit tests |
| `bun run typecheck` | TypeScript check |
| `bun run lint` | ESLint |

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing + player search |
| `/player/[username]` | Achievement browser with filters |
| `/player/[username]/breakdown` | Per-game AP breakdown |
| `/compare?p1=&p2=&metric=` | Compare two players |

## Stack

- Next.js 16, React 19, TypeScript
- TanStack Query + TanStack Table
- Tailwind CSS v4
- `hypixel-api-reborn` (same as Discord bot)

Core Hypixel logic is ported from `hypixel-achievements-discord-bot` into `lib/` for future consolidation.
