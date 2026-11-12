# Note Manager v3

A full-stack note manager for capturing **daily work notes, standup updates, and other work notes**,
with a built-in **Break Calculator** that computes your expected return time from a break (default 1h30m).

This is a ground-up rewrite of an earlier personal utility into a real full-stack system: a typed REST API
backed by MongoDB with authentication, and a modern React frontend — built in phases, with tests and CI.

## Stack

| Layer    | Tech                                                        |
| -------- | ----------------------------------------------------------- |
| Monorepo | npm workspaces (`apps/*`, `packages/*`)                     |
| Backend  | Express 5 + TypeScript, MongoDB + Mongoose, JWT auth, Zod   |
| Frontend | React + Vite + TypeScript, React Router, TanStack Query     |
| Shared   | `@note-manager/shared` — Zod schemas + inferred types       |
| Testing  | Vitest, supertest + mongodb-memory-server (API), Playwright |
| Tooling  | ESLint 9, Prettier, Husky + lint-staged, GitHub Actions     |

## Repository layout

```
note-manager-v3/
├── apps/
│   ├── api/            Express + MongoDB REST API  (Phase 1)
│   └── web/            React + Vite frontend        (Phase 2)
├── packages/
│   └── shared/         Zod schemas & shared types + Break Calculator logic
├── docker-compose.yml  Local MongoDB (api/web services added in Phase 3)
└── .github/workflows/  CI pipeline
```

## Getting started

Prerequisites: **Node 20+**, **npm 10+**, and **Docker** (for MongoDB).

```bash
# 1. Install all workspace dependencies
npm install

# 2. Copy environment defaults
cp .env.example .env            # (Windows: copy .env.example .env)

# 3. Start MongoDB
docker compose up -d mongodb

# 4. Build the shared package (API/web depend on it)
npm run build --workspace @note-manager/shared
```

## Scripts (root)

| Script              | Description                         |
| ------------------- | ----------------------------------- |
| `npm run build`     | Build `shared`, then all workspaces |
| `npm run typecheck` | Type-check every workspace          |
| `npm run lint`      | Lint the whole repo (ESLint)        |
| `npm run format`    | Format with Prettier                |
| `npm test`          | Run every workspace's tests         |

## Roadmap

- [x] **Phase 0** — Monorepo foundation, shared types, tooling, CI, Docker
- [ ] **Phase 1** — Express API: MongoDB models, auth, notes/note-types/tags, tests
- [ ] **Phase 2** — React frontend: auth, notes CRUD, markdown, search, Break Calculator
- [ ] **Phase 3** — Full test suite, e2e, containerized stack
- [ ] **Phase 4** — Standup digest, ticket-reference links, search upgrades

## License

MIT
