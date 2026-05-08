# react-sketch-ruler — Agent Guide

> This file is intended for AI coding agents. It describes the project structure, build process, and conventions you must follow when working in this repository.

---

## Project Overview

`react-sketch-ruler` is a React component library that provides a sketch-style ruler interface with pan/zoom capabilities for page presentation. It is designed for use cases such as low-code platforms, data-visualization dashboards (大屏可视化), and graphic-editing tools that need a Photoshop-like zoom/pan experience.

Key features:
- Mouse-centered zoom (powered by `simple-panzoom`)
- Ctrl + mouse-wheel zoom
- Space + drag to pan the canvas
- Reference/guideline management (add / delete / drag)
- Snap-to-grid functionality
- Auto-centering on initialization
- Shadow highlight with numeric text
- Customizable palette / themes
- Eye icon in the top-left corner to toggle reference lines

The project is a **pnpm workspace** monorepo with two packages:
- `packages/sketch-ruler` — the published React component library
- `packages/docs` — the documentation / demo site (deployed to GitHub Pages)

Language: Chinese comments and documentation are used throughout the codebase.

---

## Technology Stack

| Layer | Tool |
|-------|------|
| Framework | React 19 (peer dependency, also supports React 18) |
| Language | TypeScript 5.5+ |
| Build tool | Vite 7+ |
| Styling | Less |
| Pan / zoom engine | `simple-panzoom` (peer dependency) |
| Package manager | pnpm |
| Linting | ESLint 9 (flat config) |
| Formatting | Prettier |
| CI / CD | GitHub Actions |

---

## Repository Structure

```
.
├── package.json                 # Root workspace manifest (private)
├── pnpm-workspace.yaml          # pnpm workspace definition
├── tsconfig.json                # IDE-only root tsconfig with project references
├── tsconfig.common.json         # Shared TS compiler options
├── tsconfig.eslint.json         # TS config used by ESLint
├── eslint.config.mjs            # ESLint 9 flat config
├── .prettierrc.json             # Prettier config
├── scripts/
│   └── release.js               # Interactive release script
├── .github/
│   └── workflows/
│       └── gh-pages.yml         # CI: build demo & deploy to GitHub Pages
├── packages/
│   ├── sketch-ruler/            # 📦 Published library
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts       # Library build config (UMD + ESM)
│   │   └── src/
│   │       ├── index.tsx        # Public entry point
│   │       ├── index-types.ts   # All TypeScript interfaces
│   │       ├── canvas-ruler/
│   │       │   ├── index.tsx    # CanvasRuler component (canvas 2D rendering)
│   │       │   └── utils.ts     # Drawing utilities + debounce helper
│   │       └── sketch-ruler/
│   │           ├── index.tsx    # SketchRule main component (panzoom integration)
│   │           ├── index.less   # Component styles (Less)
│   │           ├── RulerWrapper.tsx
│   │           ├── RulerLine.tsx
│   │           ├── useLine.ts   # Hook for line drag / snap logic
│   │           └── cornerImg64.ts # Base64 eye icons
│   └── docs/                    # 📖 Documentation / demo site
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts       # App build config (base: './')
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── router.tsx       # React Router hash routes
│           ├── views/Home.tsx   # Layout with sidebar, code viewer, i18n
│           ├── examples/        # Demo pages (Basic, Comprehensive, Moveble, Bigscreen, EightK, …)
│           ├── components/layout/
│           ├── i18n/            # i18n setup (zh / en)
│           └── assets/
```

---

## Build and Development Commands

All commands should be run from the repository root.

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies for the whole workspace |
| `pnpm dev` | Build the library, then start the docs dev server on port `5274` |
| `pnpm build` | Build the `sketch-ruler` library only |
| `pnpm build:demo` | Build the library **and** the docs site for deployment |
| `pnpm format` | Format code with Prettier |
| `pnpm lint` | Lint (and auto-fix) with ESLint |
| `pnpm changelog` | Generate changelog for `sketch-ruler` using conventional changelog |
| `pnpm release` | Build + run the interactive release script |

### Library build details (`packages/sketch-ruler/vite.config.ts`)
- Output directory: `lib/`
- Library mode with **UMD + ESM** builds
- `react` and `react-dom` are externalized
- `.d.ts` declarations generated via `vite-plugin-dts`
- CSS extracted to `lib/index.css`

### Docs build details (`packages/docs/vite.config.ts`)
- Standard Vite app build
- Output: `packages/docs/dist/`
- `base: './'` for relative-path deployment

---

## Code Style Guidelines

### Prettier (`.prettierrc.json`)
- 2-space indentation
- No semicolons
- Single quotes
- Print width: `100`
- No trailing commas
- `arrowParens: always`

### ESLint (`eslint.config.mjs`)
- Flat config using ESLint 9
- Extends: `eslint:recommended`, `@typescript-eslint/recommended`, `prettier`
- Parser: `@typescript-eslint/parser`
- Relaxed rules (intentionally off):
  - `@typescript-eslint/no-explicit-any`
  - `@typescript-eslint/ban-types`
  - `@typescript-eslint/no-empty-function`
  - `@typescript-eslint/no-empty-interface`
  - `@typescript-eslint/no-empty-object-type`
- `@typescript-eslint/no-unused-vars` is **error** (args starting with `_` are ignored)
- `react-refresh/only-export-components` is enabled

### TypeScript
- Strict mode enabled (`strict: true`)
- Project references (`composite: true`) — each package has its own `tsconfig.json`
- `sketch-ruler` uses `moduleResolution: bundler`
- `docs` uses `moduleResolution: node` with path alias `@/* → src/*`

---

## Component Conventions

When modifying React components in this project, follow the existing patterns:

1. **Performance**
   - Use `useMemo` for style objects and computed values.
   - Wrap sub-components with `memo()` where appropriate.

2. **Imperative API**
   - The main component (`SketchRule`) uses `forwardRef` + `useImperativeHandle` to expose methods (`reset`, `zoomIn`, `zoomOut`, `initPanzoom`, `panzoomInstance`).

3. **Slot pattern**
   - Children are parsed by the `slot` prop rather than standard React composition:
     - `slot="default"` (or no `slot`) → canvas content
     - `slot="btn"` → control buttons overlay

4. **Canvas rendering**
   - Rulers are drawn with `CanvasRenderingContext2D`.
   - DPR-aware scaling is applied for high-DPI displays.
   - `requestAnimationFrame` is used for smooth canvas redraws.

5. **Styling**
   - Uses **Less** (not CSS modules).
   - Colors are passed via the `palette` prop; no CSS variables are used for theming.
   - Dark / light theme support is achieved by swapping the `palette` object.

---

## Testing Instructions

**No test framework is currently configured.**
- The docs `tsconfig.json` explicitly excludes `**/*.spec.ts`.
- There are no test files in the repository.
- The README lists “加入单元测试功能” (add unit testing) as a planned future feature.

If you add tests, introduce a test runner (e.g., Vitest or Jest) and update the relevant `tsconfig.json` files to include test files.

---

## CI / CD and Release Process

### GitHub Actions (`.github/workflows/gh-pages.yml`)
- Triggers on `push` and `pull_request` to `main`
- Uses Node 20 + pnpm
- Runs `pnpm i --no-frozen-lockfile` then `pnpm build:demo`
- Deploys `packages/docs/dist` to GitHub Pages via `peaceiris/actions-gh-pages@v3`

### Release script (`scripts/release.js`)
- Interactive CLI using `enquirer`
- Supports `patch` / `minor` / `major` or custom version selection
- Updates version in **root** and **all package** `package.json` files
- Copies `README.md` into the package directory before publishing
- Runs `npm publish` from `packages/sketch-ruler`
- Uses `chalk` for colored output and `semver` for version validation

### Publishing
- Registry: `https://registry.npmjs.org/`
- Package name: `react-sketch-ruler`
- The library package (`sketch-ruler`) is **not private**; the root is private.

---

## Peer Dependencies

Consumers of the library must install these themselves:
- `react` >= 18 || >= 19
- `react-dom` >= 18 || >= 19
- `simple-panzoom` ^2.0.2

The library itself has **zero runtime dependencies** (besides peers).

---

## Security Considerations

- The library operates entirely in the browser; no server-side code or secrets are present.
- The release script runs `npm publish` locally and requires npm authentication.
- No `.env` files or sensitive credentials are stored in the repository.
- When adding new dependencies, keep them as `devDependencies` or `peerDependencies` to minimize the published bundle size.

---

## Quick Reference for Agents

- **Language of comments / docs:** Chinese
- **Indentation:** 2 spaces, no semicolons, single quotes
- **Import external libs via:** pnpm workspace / root devDependencies
- **Build before dev:** `pnpm build` (the docs depend on the built library)
- **Deploy demo:** `pnpm build:demo` (CI does this automatically on `main`)
- **Add a new demo page:** Create a component under `packages/docs/src/examples/` and register it in `packages/docs/src/router.tsx`
