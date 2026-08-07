# Hypixel Achievements

A Minecraft-styled web app for browsing Hypixel player achievements, viewing per-game achievement point (AP) breakdowns, and comparing two players head-to-head.

Built with Next.js and the `hypixel-api-reborn` client, with a pixel-art UI theme.

## Features

- **Player search** — look up any player by username or UUID.
- **Achievement browser** — filter by game, type (one-time/tiered), and status (completed/uncompleted); search by name; sort by points, progress, global or per-game unlock percentage.
- **Quest tracker** — browse daily, weekly, and monthly quests per game with live progress from the Hypixel API.
- **AP breakdown** — a per-game table of obtained vs. missing achievement points, completion counts, and totals.
- **Player comparison** — head-to-head AP comparison across every game, sorted by obtained or missing points, with a plain-language verdict.
- **Rank display** — formatted player ranks and prefixes.
- **Caching** — Hypixel and Mojang responses are cached on disk via Next.js 16 Cache Components (`use cache: remote`) with TTLs (achievements definitions 24h, player data 5m, UUID lookups 6h) and deduplicated in-flight requests.

## Pages

| Path                           | Description                                  |
| ------------------------------ | -------------------------------------------- |
| `/`                            | Landing page with player search              |
| `/player/[username]`           | Achievement browser with filters and sorting |
| `/player/[username]/breakdown` | Per-game achievement points breakdown        |
| `/player/[username]/quests`    | Per-game daily, weekly, and monthly quests   |
| `/compare?p1=&p2=&metric=`     | Compare two players                          |

## Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Data:** `hypixel-api-reborn`, TanStack Query, TanStack Table
- **Styling:** Tailwind CSS v4, Minecraft-style theme with the `--font-pixel` display font
- **Caching:** Next.js 16 Cache Components (`use cache: remote`) with a disk cache handler (`lib/.cache/next-cache`)

## Setup

1. Install dependencies (Bun or npm):

    ```bash
    bun install
    ```

2. Create your local environment file from the example and set a Hypixel API key:

    ```bash
    cp .env.example .env.local
    ```

    ```
    HYPIXEL_API_KEY=your_hypixel_api_key_here
    ```

    You can get an API key with `/api new` in Hypixel, or by applying at [developer.hypixel.net](https://developer.hypixel.net).

3. Run the dev server:

    ```bash
    bun dev
    ```

    Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command             | Description              |
| ------------------- | ------------------------ |
| `bun dev`           | Start development server |
| `bun build`         | Production build         |
| `bun start`         | Start production server  |
| `bun test`          | Run unit tests (Vitest)  |
| `bun run typecheck` | TypeScript check         |
| `bun run lint`      | ESLint                   |

## Docker

A multi-stage `Dockerfile` and `docker-compose.yml` are included for production deployment. The compose file wires the app behind a Traefik router on the `proxy` network and persists the response cache in a named volume.

```bash
docker compose up -d --build
```

## Project structure

```
app/                 # App Router pages
  player/[username]      # Achievement browser + breakdown pages
  compare/               # Compare page
components/          # React components (pages, UI, layout)
lib/
  hypixel/           # Hypixel API client, caching, correlation logic
  logic/             # Breakdown + comparison computation
  queries/           # TanStack Query hooks
  util/              # Games, filters, formatting, validation
tests/               # Unit tests
```

## License

[MIT](LICENSE)
