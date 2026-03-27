# buner

Frontend build toolkit for **Vite + React SSR** projects — SCSS pipeline, SSR dev server, prerender, and backend integration.

## Install

```bash
npm install buner
```

Or install globally for the CLI:

```bash
npm install -g buner
```

## Quick Start

### Scaffold a new project

```bash
npx buner create my-app
cd my-app
```

`buner create` now asks you to choose a package manager (`npm`, `pnpm`, `yarn`, or `bun`) and installs dependencies automatically.

### Development

```bash
npx buner dev
```

Starts all watchers concurrently: SCSS, states, Vite HMR, and the Express SSR dev server.

### Production Build

```bash
npx buner build
```

Produces `dist/static/` (client) and `dist/server/` (SSR) output.

### Static Site Generation

```bash
npx buner generate
```

Runs: states → styles → build → prerender (with content hashes).

### Build for Deployment (eshn mode)

```bash
npx buner eshn
```

Same as `generate` but with `--mode eshn`.

### Backend Integration

```bash
npx buner inte
```

Runs: styles → build → prerender → copies assets to the directory configured in `VITE_INTE_ASSET_DIR` (set in `.env`).

## CLI Commands

| Command              | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `buner create [dir]` | Scaffold a new frontend project                      |
| `buner dev`          | Watch mode (styles + states + Vite HMR + SSR server) |
| `buner serve`        | Start the SSR dev server only                        |
| `buner build`        | Vite static + SSR build                              |
| `buner generate`     | Full static site generation                          |
| `buner eshn`         | Generate with `--mode eshn`                          |
| `buner inte`         | Build and integrate with backend                     |
| `buner styles`       | Compile SCSS only                                    |
| `buner prerender`    | Pre-render HTML files only                           |

## Configuration

Configuration is done via `.env` files in your project root:

| Variable                | Default   | Description                                                         |
| ----------------------- | --------- | ------------------------------------------------------------------- |
| `VITE_BASE_URL`         | `/`       | Base path for all assets                                            |
| `VITE_PORT`             | `5000`    | Dev server port                                                     |
| `VITE_PATH_EXTENSION`   | `'.html'` | File extension for routes (`.html` or empty)                        |
| `VITE_TITLE_SUFFIX`     | —         | Browser tab title suffix                                            |
| `VITE_INTE_ASSET_DIR`   | —         | Integration output path for assets (e.g. `../MyApp/wwwroot/assets`) |
| `VITE_INTE_PATTERN_DIR` | —         | Integration output path for HTML patterns                           |

Override per environment with `.env.development`, `.env.eshn`, etc.

## Peer Dependencies

Your project must install these:

```bash
npm install react react-dom react-router-dom
```

## Project Structure

A buner project looks like this:

```
my-app/
├── .env                    # Environment variables
├── index.html              # HTML template
├── vite.config.ts          # Vite config (imports buner's xpack/config)
├── tsconfig.json
├── public/
│   └── assets/             # Static assets (fonts, images, vendors)
└── src/
    ├── app.tsx             # Route definitions → components
    ├── entry-client.tsx    # Client-side hydration
    ├── entry-server.tsx    # SSR render function
    ├── routes.ts           # Route registry
    ├── react-loader.tsx    # Lazy component loader
    ├── pages/              # Your page components
    ├── atoms/              # Atomic components
    ├── molecules/          # Molecular components
    ├── organisms/          # Organism components
    └── assets/
        ├── styles/         # SCSS (abstracts, mixins, base)
        └── scripts/        # Standalone JS/TS assets
```

## SCSS Pipeline

buner compiles SCSS with **sass** + **postcss** + **autoprefixer** + **cssnano**.

SCSS files are automatically discovered from:
- `src/assets/styles/style-base.scss` — base styles (includes atoms + molecules)
- `src/organisms/**/*.scss` — prefixed with `b-`
- `src/templates/**/*.scss` — prefixed with `p-`
- `xpack/styles/**/*.scss` — framework UI styles

## SCSS Migration

To replace deprecated `@import` statements with `@use` and `@forward`:

```bash
bun migrate-scss.ts
```

## License

MIT
