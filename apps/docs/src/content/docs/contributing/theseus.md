---
title: EMCL App
description: Guide for contributing to EMCL desktop app (Electron)
sidebar:
  order: 3
---

EMCL is the Electron-based launcher that lets users conveniently play any mod or modpack on Modrinth. It uses a Rust native addon (napi-theseus) as the backend and Vue.js as the frontend.

## Setup

### 1. Install prerequisites

- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install)

### 2. Install dependencies & set up .env

- Run `pnpm install` in the workspace root folder.
- In `packages/app-lib` you should be able to see `.env.prod`, `.env.staging` — for basic app work, it's recommended to use `.env.prod`. Copy the relevant file into a new `.env` file within the `packages/app-lib` folder.

### 3. Run the app

```bash
# Start frontend dev server
pnpm --filter @emcl/app-frontend dev

# In another terminal, build Rust native addon
cd apps/app-electron && pnpm dev:native

# Launch Electron
cd apps/app-electron && pnpm dev:electron
```

Or run everything at once:
```bash
cd apps/app-electron && pnpm dev
```

## Architecture

The app is split into three parts:

- `apps/app-frontend`: The Vue.JS frontend for the app
- `packages/app-lib`: The library holding all the core logic for the desktop app
- `apps/app-electron`: The Electron shell that wraps the frontend and loads the native Rust addon

The app's internal database is stored in SQLite. For production builds, this is found at <APPDIR>/app.db.

When running SQLX commands, be sure to set the `DATABASE_URL` environment variable to the path of the database.

You can edit the app's data directory using the `THESEUS_CONFIG_DIR` environment variable.

## Ready to open a PR?

If you're prepared to contribute by submitting a pull request, ensure you have met the following criteria:

- Run `pnpm prepr:frontend` to address any fixable issues automatically.
- Run `cargo fmt` to format Rust-related code.
- Run `cargo clippy` to validate Rust-related code.
- Run `cargo sqlx prepare --package theseus` if you've changed any SQL code to validate statements.

[pnpm]: https://pnpm.io
