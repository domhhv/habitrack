# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Habitrack is a modern habit tracking web application built as a progressive web app (PWA) with calendar-based visualization for habit logging. The stack includes React 19 + TypeScript, Vite, Zustand state management, HeroUI components, Tailwind CSS v4, and Supabase as the backend.

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
yarn db:reset          # Reset DB with migrations and seeds
yarn db:diff           # Generate migration from schema changes
yarn db:gen-types      # Generate TypeScript types from schema
yarn lint:sql          # SQLFluff SQL linting
yarn fix:sql           # Fix SQL formatting
```

## Architecture Overview

### Technology Stack

- **Frontend**: React 19, TypeScript 5.9, Vite 7, React Router v7
- **State Management**: Zustand v5 with Immer middleware
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
- `@const` → `src/constants`
- `@db-types` → `supabase/database.types`
- `@tests` → `tests`

### Key Directories

- **`src/components/`**: Domain-organized components (calendar, habit, trait, account, common)
- **`src/stores/`**: Zustand stores for each domain (habits, occurrences, traits, notes)
- **`src/services/`**: Supabase API service layer
- **`supabase/`**: Database migrations, schema, and generated types

### State Management Pattern

- **Zustand with Immer**: Each domain has its own store with state + actions
- **Custom Hooks**: Separate hooks for accessing state vs actions
- **Data Flow**: UI → Store Actions → Services → Supabase → Real-time updates

### Database Development

- Always run `yarn db:gen-types` after schema changes
- Use `yarn db:diff` to generate migrations from schema changes
- Local Supabase runs on Docker - ensure Docker is installed
- Database types are auto-generated in `supabase/database.types.ts`

### Component Architecture

- Built on **React Aria** foundation for accessibility
- **HeroUI** component library with Tailwind styling
- **Domain-driven organization**: components grouped by business function
- **Mobile-first responsive design** with Tailwind breakpoints

### Code Quality Standards

- **TypeScript strict mode** with full type coverage
- **ESLint v9** flat config with custom rules
- **Prettier** with Tailwind plugin for formatting
- **Import organization** via ESLint perfectionist plugin

### Storage Configuration

Supabase storage buckets:

- `habit_icons`: Public bucket (100KB limit per file)
- `occurrence_photos`: Private bucket (5MB limit per file)

### Environment Requirements

- Node.js 22.15.0+
- Yarn 4.9.4
- Docker (for local Supabase)
- Supabase CLI v2

### Testing Approach

- **Vitest** with jsdom environment for unit tests
- **React Testing Library** for component testing
- Test files located alongside components or in dedicated test directories
- Coverage reports available with `yarn test:coverage`

### Build Configuration

- **Vite** with optimized chunk splitting for major dependencies
- **Bundle analysis** available in production builds
- **PWA capabilities** with installable web app features
- **Vercel** deployment with preview environments for PRs
