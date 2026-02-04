# Contributing to Habitrack

Thank you for your interest in contributing to Habitrack! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/) (22.22.0)
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) (v2)
- [Docker](https://docs.docker.com/get-started/get-docker/)
- Yarn is used as a package manager and is automatically available via Corepack (bundled with Node.js)

### Development Setup

1. Fork and clone the repository

   ```bash
   git clone https://github.com/domhhv/habitrack.git
   cd habitrack
   ```

2. Install dependencies

   ```bash
   yarn install
   ```

3. Follow these steps from the readme to set up Supabase locally: [Local Database Setup](https://github.com/domhhv/habitrack?tab=readme-ov-file#local-database-setup)

   _Alternatively, you can create your own Supabase project and connect to your remote Supabase instance by providing the `SUPABASE_URL` and `SUPABASE_ANON_KEY` in your environment variables._

4. Set up environment variables

   ```bash
   cp .env.example .env.development
   # Add your local or remote SUPABASE_URL and SUPABASE_ANON_KEY to .env.local
   ```

5. Start the local Supabase instance (if using local)

   ```bash
   yarn db:start
   ```

6. Start development server
   ```bash
   yarn dev # automatically opens http://localhost:5173 in your default browser
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates
- `chore/` - Build process or tooling changes
- `style/` - Code style or formatting changes
- `perf/` - Performance improvements

Example: `feat/add-habit-preset` or `fix/login-bug`

The full list of conventional commit types can be found [here](https://www.conventionalcommits.org/).

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/).

Format: `<type>(<scope>): <subject>`

Types:

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style/formatting
- `refactor` - Code refactoring
- `test` - Tests
- `chore` - Build/tooling

Common Scopes:

- `auth` - Authentication and account management
- `calendar` - Calendar views
- `trait` - Habit traits
- `habit` - Habit management
- `occurrence` - Habit occurrences and logging
- `note` - Notes functionality
- `metric` - Habit and occurrence metrics

Examples:

```
feat(habit): add preset templates for common habits
fix(auth): resolve login redirect issue
docs(calendar): update calendar usage in readme
```

Scope and type should always be lowercase, while the subject may contain pascal and camel case for proper nouns (e.g., variables, function names).

### Code Quality

All code must pass quality checks before merging:

```bash
yarn typecheck      # TypeScript type checking
yarn eslint:check   # Linting
yarn prettier:check # Code formatting
yarn lint:sql       # SQL linting
```

Pre-commit hooks will automatically run these checks via Husky and lint-staged.

Auto-fix issues:

```bash
yarn eslint:fix     # Fix linting issues
yarn prettier:write # Format code
yarn fix:sql   # Fix SQL linting issues
```

## Code Style Guidelines

### General Principles

- Use TypeScript for all code
- Prefer arrow functions over function declarations for components
- Prefer inferred types over explicit annotations
- Prefer default exports for React components, hooks, and whenever a module exports a single entity
- Prefer `type` over `interface` unless extending or merging
- Use `@` path aliases for imports
- Use PascalCase for React component files and lowercase-with-hyphens for directories and any other files

### Component Guidelines

```typescript
// Good - function declaration and default export
const MyComponent = () => {
  return <div>Content</div>;
};

export default MyComponent;

// Avoid - arrow function and named export
export function MyComponent() {
  return <div>Content</div>;
}
```

### Type Inference

Prefer inferred types over explicit annotations:

```typescript
// Good
const count = 5;
const items = ['a', 'b', 'c'];

// Avoid unless necessary
const count: number = 5;
const items: string[] = ['a', 'b', 'c'];
```

## Making Changes

### Adding Features

1. Create a new branch from `main`
2. Implement the feature with tests if applicable
3. Update documentation (README, CLAUDE.md if architecture changes)
4. Ensure all quality checks pass
5. Submit a pull request

### Fixing Bugs

1. Create an issue describing the bug if one doesn't exist
2. Reference the issue in your branch name: `fix/123-description`
3. Include test cases that verify the fix
4. Submit a pull request referencing the issue

### Pull Request Process

1. Update README.md if you're adding user-facing features
2. Update CLAUDE.md if you're changing architecture or adding significant technical patterns
3. Ensure CI checks pass (code health, commit lint)
4. Request review from maintainers
5. Address review feedback
6. Once approved, maintainers will merge your PR

## Project Architecture

[//]: # 'TODO: Add architecture diagram and explanation'

TBD

## Testing

Currently, the project focuses on manual testing, but it has a few unit tests. When adding features:

1. Test in both light and dark themes
2. Verify responsive behavior

Future: We plan to extend existing automated unit-testing with Vitest and React Testing Library.

## Documentation

### Code Documentation

- Update CLAUDE.md for architectural changes

### User Documentation

- Update README.md for user-facing features
- Include examples where helpful
- Keep installation/setup instructions current

## Getting Help

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Tag issues appropriately (bug, enhancement, documentation, etc.)
- Get in touch with the core maintainer via email if needed: domhryshaiev@gmail.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Habitrack!
