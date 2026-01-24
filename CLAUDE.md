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

### Database Schema Changes - Quick Reference

#### 1. Modify the Declarative Schema

Edit the appropriate schema file in `supabase/schemas/`:

- `03_traits.sql` - Traits table
- `04_habits.sql` - Habits table
- `05_occurrences.sql` - Occurrences table
- `06_notes.sql` - Notes table

Create a new declarative schema file for any new standalone entity introduced

#### 2. Run Migration Workflow

```bash
# Stop local db (required before diffing)
yarn db:stop

# Generate migration file from schema diff
yarn db:diff -f <migration_name>

# Review the generated migration in supabase/migrations/
# Ensure it only contains intended changes (remove any unrelated drops/alters)

# Start db (applies pending migrations automatically)
yarn db:start

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
- **ESLint v9** flat config with custom rules
- **Prettier** with Tailwind plugin for formatting
- **Import organization** via ESLint perfectionist plugin

### Storage Configuration

Supabase storage buckets:

- `habit_icons`: Public bucket (100KB limit per file)
- `occurrence_photos`: Private bucket (5MB limit per file)

### Environment Requirements

- Node.js 22.22.0
- Yarn 4.12.0
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
