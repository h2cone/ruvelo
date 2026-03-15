# Repository Guidelines

## Project Structure & Module Organization

`app/` contains Expo Router screens and route entry points such as `index.tsx`, `run.tsx`, `summary/[id].tsx`, and `_layout.tsx`. `src/components/` holds reusable UI, `src/hooks/` owns stateful run logic, `src/services/` wraps location and tracking integrations, `src/db/` contains SQLite access and schema, `src/utils/` stores shared helpers and design tokens, and `src/types/` defines shared types. Use `*.native.ts(x)` and `*.web.ts(x)` when behavior differs by platform. Keep supporting notes in `docs/`.

## Build, Test, and Development Commands

`npm install` installs dependencies. `npm start` launches the Expo dev server. `npm run android`, `npm run ios`, and `npm run web` open the app on a specific platform. `npm run typecheck` runs `tsc --noEmit`; treat it as the minimum pre-merge check.

## Coding Style & Naming Conventions

This project uses strict TypeScript. Match the existing style: 2-space indentation, double quotes, semicolons, and trailing commas where TypeScript emits them naturally. Name React components and providers in PascalCase, hooks with a `use` prefix, helpers in lowerCamelCase, and route files by URL shape, for example `summary/[id].tsx`. Prefer shared constants from `src/utils/constants.ts` over duplicating values, and prefer platform-specific files over inline platform conditionals when implementations meaningfully diverge.

## Testing Guidelines

There is no automated test runner configured yet. Before opening a PR, run `npm run typecheck` and manually verify the affected flow in Expo. At minimum, test run start, pause, resume, finish, local persistence, and summary rendering on the platform you changed. Note the platform you validated (`ios`, `android`, or `web`) in the PR. If you add tests later, place them near the feature or under `src/__tests__/`.

## Commit & Pull Request Guidelines

Current history uses short, imperative commit subjects such as `Build initial Ruvelo run-tracking app`. Follow that format and keep each commit focused on one logical change. PRs should include a concise description, linked issue when available, and screenshots or recordings for UI updates. Call out permission changes, background tracking behavior, or SQLite schema updates explicitly so reviewers can test them safely.
