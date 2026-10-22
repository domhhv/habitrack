# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Habitrack is a modern habit tracking web application built as a progressive web app (PWA) with calendar-based visualization for habit logging. The stack includes React 19 + TypeScript, React Router v8 in framework mode (route loaders and actions own all server data), Vite, Zustand for client-only UI state, HeroUI components, Tailwind CSS v4, and Supabase as the backend.

## Essential Commands

### Development

```bash
yarn dev               # Start development server
yarn build            # Production build
yarn typecheck        # TypeScript type checking
yarn eslint:check     # ESLint linting
yarn eslint:fix       # Fix ESLint issues
yarn prettier:check   # Check Prettier formatting
yarn prettier:write   # Apply Prettier formatting
```

### Testing

```bash
yarn test             # Run tests with Vitest
yarn test:watch       # Run tests in watch mode
yarn test:coverage    # Run tests with coverage
```

### Database (Supabase)

```bash
yarn db:start          # Start local Supabase (requires Docker)
yarn db:stop           # Stop local Supabase
yarn db:status         # Check current status of local database
yarn db:reset          # Reset DB with migrations and seeds
yarn db:diff           # Generate migration from schema changes, additionally supplying migration name after -f flag
yarn db:migration:up   # Apply current migrations
yarn db:gen-types      # Generate TypeScript types from schema
yarn lint:sql          # SQLFluff SQL linting
yarn fix:sql           # Fix SQL formatting
```

## Architecture Overview

### Technology Stack

- **Frontend**: React 19, TypeScript 6, Vite 8, React Router v8 (framework mode, SSR enabled, data loaded in `clientLoader`s)
- **Server data**: React Router `clientMiddleware`/`clientLoader`/`clientAction`, fetchers and revalidation
- **Client UI state**: Zustand v5 with Immer middleware (drawers, confirmation dialog, calendar filters, mobile sidebar, theme)
- **UI**: HeroUI (React Aria-based), Tailwind CSS v4, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Testing**: Vitest, React Testing Library

### Path Aliases

Use these aliases throughout the codebase:

- `@components` → `src/components`
- `@pages` → `src/pages`
- `@stores` → `src/stores`
- `@services` → `src/services`
- `@hooks` → `src/hooks`
- `@models` → `src/models`
- `@utils` → `src/utils`
- `@db-types` → `supabase/database.types`
- `@tests` → `tests`

### Key Directories

- **`src/routes.ts`**: Route config. Every route has an explicit `id`; app routes are nested under the `app` layout (`src/App.tsx`), calendar views under the `calendar` layout (`src/pages/CalendarLayout.tsx`)
- **`src/pages/`**: Route modules (page component plus `clientLoader`/`clientAction`/`ErrorBoundary` exports), typed via `./+types/<File>`
- **`src/routes/resources/`**: Component-less resource routes used only by fetchers (`/resources/occurrences`, `/resources/notes`)
- **`src/components/`**: Domain-organized components (calendar, habit, trait, account, common)
- **`src/services/`**: Supabase API service layer, plus the calendar range caches (`calendar-data.service.ts`)
- **`src/stores/`**: Zustand client UI state only (`ui.store.ts`, `theme.store.ts`)
- **`supabase/`**: Database migrations, schema, and generated types

### Data and State Pattern

Server data never goes into Zustand. See [docs/STATE_MIGRATION.md](docs/STATE_MIGRATION.md) for the full history and rationale.

- **Supabase client**:
  - The session lives in cookies (`@supabase/ssr`). The `app` layout puts the request's client into `supabaseContext`. Its `clientMiddleware` uses the browser client, and its server `middleware` (`supabaseMiddleware`) creates a server client per request and sends refreshed auth cookies back with the response.
  - Every service takes the client (`TypedSupabaseClient`) as its first argument. Loaders and actions pass `context.get(supabaseContext)`. Components and hooks that must call Supabase directly use `getSupabaseBrowserClient()`.
  - Habits, habit details, notes, settings and OAuth consent sit under the pathless `authenticated` layout (`src/pages/AuthenticatedLayout.tsx`). Its server `middleware` redirects signed-out document requests, and its `clientMiddleware` signed-out navigations, to `/login?returnTo=…` (`getLoginPath`). The login, register and anonymous-login pages go back to `returnTo` (`getReturnToPath`). The calendar stays public.
  - Auth redirects land on `/auth/callback` (`src/pages/AuthCallbackPage.tsx`). Its server `loader` exchanges an OAuth or PKCE `code`, or verifies an email `token_hash`, then redirects to `next`, which `getSafeRedirectPath` keeps on the same origin. Email redirects go through it too, and a `next` that points back at the callback is unwrapped. Email templates link to `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=…&next={{ .RedirectTo }}` (local copies in `supabase/templates/`).
- **Loading**:
  - The `app` layout `clientMiddleware` puts the session user and profile into `userContext`/`profileContext`.
  - The `app` layout `clientLoader` returns `{ user, profile, habits, traits }`, read via `useUser`/`useProfile`/`useHabits`/`useTraits`.
  - The `calendar` layout `clientLoader` computes the range from the URL and returns the occurrences and notes, read via `useCalendarData()`.
  - Pages load their own data in their `clientLoader` (habit stats, a habit, the notes list, connected identities).
- **Mutations**:
  - Every write goes through a route `clientAction`. Branch on an `intent` and type the payloads in `src/models/*-submission.model.ts`.
  - UI that belongs to one page submits to that page's route. Global UI (drawers) submits to a `/resources/*` route.
  - Send JSON (`encType: 'application/json'`), or multipart `FormData` when files are involved.
- **Submitting**:
  - Components submit with `useActionFetcher(onSuccess)` (a `useFetcher` that calls `onSuccess` once the action returns `{ ok: true }`), or `<Form>`/`useFetcher` directly. Pending UI comes from `fetcher.state`/`useNavigation()`/`useIsSubmitting()`, not `useState`.
  - Block a new submission on a shared fetcher while one is pending.
- **Results**:
  - Wrap action work in `runAction(promise, actionType)`. It keeps the standard toasts and returns `{ ok: true }` or `{ ok: false, error }` without a 4xx status, so partial writes still revalidate.
  - Return `data(…, { status: 400 })` only for failures that wrote nothing.
- **Revalidation**:
  - React Router revalidates active loaders after each action.
  - The `app` layout `shouldRevalidate` skips plain navigations unless the app data was marked stale (`markAppDataStale`).
  - Actions that change calendar data call `clearCalendarData()` (or `invalidateCalendarOccurrences`/`invalidateCalendarNotes`) in `finally`.
- **URL state**: Prefer search params for shareable UI state (e.g. `/notes?pages=N`).
- **Zustand**: Only for client UI state that has no server source.

### Database Development

- Always run `yarn db:gen-types` after schema changes
- Use `yarn db:diff` to generate migrations from schema changes
- Local Supabase runs on Docker - ensure Docker is installed
- Database types are auto-generated in `supabase/database.types.ts`

### Database Schema Changes - Quick Reference

#### 1. Modify the Declarative Schema

Edit the appropriate schema file in `supabase/schemas/`:

- `04_traits.sql` - Traits table
- `05_habits.sql` - Habits table
- `06_occurrences.sql` - Occurrences table
- `07_notes.sql` - Notes table
- `08_habit_metrics.sql` - Habit metrics table
- `09_occurrence_metric_values.sql` - Occurrence metric values table
- `10_accounts.sql` - User accounts table
- `11_habit_stocks.sql` - Habit stocks table
- `12_habit_stock_metric_defaults.sql` - Stock metric defaults table
- `13_occurrence_stock_usages.sql` - Occurrence stock usages table

Create a new declarative schema file for any new standalone entity introduced

#### 2. Run Migration Workflow

```bash
# Stop local db (required before diffing)
yarn db:stop

# Generate migration file from schema diff
yarn db:diff -f <migration_name>

# Review the generated migration in supabase/migrations/
# Ensure it only contains intended changes (remove any unrelated drops/alters)

# Start db
yarn db:start

# Apply the migrations
yarn db:migration:up

# Regenerate TypeScript types
yarn db:gen-types
```

#### 3. Key Notes

- Always review the generated migration - db:diff may include unintended changes (e.g., storage policy drops)
- After db:gen-types, new fields appear in supabase/database.types.ts and flow through to model types via TablesInsert<'tablename'> and TablesUpdate<'tablename'>
- Use DEFAULT values for new columns to ensure backwards compatibility with existing data

### Component Architecture

- Built on **React Aria** foundation for accessibility
- **HeroUI** component library with Tailwind styling
- **Domain-driven organization**: components grouped by business function
- **Mobile-first responsive design** with Tailwind breakpoints

### Code Quality Standards

- **TypeScript strict mode** with full type coverage
- **ESLint v10** flat config with custom rules
- **Prettier** with Tailwind plugin for formatting
- **Import organization** via ESLint perfectionist plugin

### Storage Configuration

Supabase storage buckets:

- `habit_icons`: Public bucket (100KB limit per file)
- `occurrence_photos`: Private bucket (5MB limit per file)

### Environment Requirements

- Node.js 24.21.0
- Docker (for local Supabase)
- Yarn is used as a package manager and is automatically available via Corepack (bundled with Node.js)

### Supabase Keys

- `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are inlined into the client and server bundles through Vite `define` (declared in `src/globals.d.ts`). Every client that acts for a user uses the publishable key, so Row Level Security applies.
- `SUPABASE_SECRET_KEY` bypasses Row Level Security. Only `getSupabaseAdminClient` in `src/utils/supabase-admin.server.ts` reads it, from `process.env` at runtime. Never add it to `define`, and import that module by its path, not through the `@utils` barrel, so it stays out of the client bundle.

### Testing Approach

- **Vitest** with jsdom environment for unit tests
- **React Testing Library** for component testing
- Route `clientLoader`/`clientAction` functions are tested directly with `makeRouteArgs()` from `@tests` (builds the request plus a `RouterContextProvider` carrying `userContext` and `testSupabaseClient` in `supabaseContext`), with `@services` mocked. Service call assertions expect `testSupabaseClient` as the first argument
- In test mode, Vite defines placeholder `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` values (`TEST_ENV` in `vite.config.ts`). `getSupabaseBrowserClient()` returns an empty stub under test, so mock it from `@utils` when a component's Supabase call is asserted
- Components that use loader data, fetchers or `<Form>` render inside `createRoutesStub` from `react-router`
- Test files located alongside components or in dedicated test directories
- Coverage reports available with `yarn test:coverage`

Please do not proceed with verifying your changes in the browser unless explicitly instructed to do so.

### Build Configuration

- **Vite** with optimized chunk splitting for major dependencies
- **Bundle analysis** available in production builds
- **PWA capabilities** with installable web app features
- **Vercel** deployment with preview environments for PRs

### Feature Documentation

End-to-end documentation for complex features (database → models → services → route loaders/actions → UI):

- **[docs/METRICS.md](docs/METRICS.md)** - Habit metric definitions and occurrence metric values
- **[docs/STOCKS.md](docs/STOCKS.md)** - Habit stocks, stock metric defaults, occurrence stock usages, auto-depletion
- **[docs/COSTS.md](docs/COSTS.md)** - Occurrence cost calculation, period summaries, multi-currency handling
- **[docs/STATE_MIGRATION.md](docs/STATE_MIGRATION.md)** - Zustand → React Router data APIs migration record and the roadmap for full-stack React Router features

### Important Conventions

#### Comments

Never add explanatory comments unless absolutely necessary.

Code must be clean, readable, and self-documenting.

If a comment is necessary, use the multi-line comments (block comments) format. JSDoc and TODO comments are allowed.

Never use single-line comments except for ESLint or TypeScript directives.

- **Imports**: Use `@` path aliases as defined in tsconfig.json
- **Components**: Arrow functions preferred over function declarations
- **Export Style**: Default exports preferred for components and hooks; named exports preferred for service methods
- **Barrel Files**: When adding a new component, hook, model, service, store, or util, export them from the respective barrel files and then import using a corresponding import alias
- **File Naming**: Use PascalCase for React component files and lowercase-with-hyphens for directories and any other files
- **Types Inference**: Prefer inferred types over explicit annotations where possible
- **Object Shapes**: Prefer TypeScript's type aliases over interfaces for defining object shapes
