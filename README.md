<h1 align="center">Habitrack</h1>

<div align="center">

<a href="https://react.dev/" target="_blank" title="React"><img src="https://i.ibb.co/dwS2knBp/atom.png" alt="React" width="32" height="32" /></a>
&nbsp;
<a href="https://www.typescriptlang.org/" target="_blank" title="TypeScript"><img src="https://i.ibb.co/Kq8DY4f/typescript.png" alt="TypeScript" width="32" height="32"></a>
&nbsp;
<a href="https://vite.dev/" target="_blank" title="Vite"><img src="https://i.ibb.co/FWtjy8J/Vite-js.png" alt="Vite" width="32" height="32"></a>
&nbsp;
<a href="https://tailwindcss.com/" target="_blank" title="TailwindCSS"><img src="https://i.ibb.co/mR0BWJx/Tailwind-CSS.png" alt="Tailwind" width="32" height="32" /></a>
&nbsp;
<a href="https://www.heroui.com/" target="_blank" title="HeroUI"><img src="https://i.ibb.co/j0K0TCw/heroui-logo.png" alt="HeroUI" width="32" height="32"></a>
&nbsp;
<a href="https://supabase.com/" target="_blank" title="Supabase"><img src="https://i.ibb.co/s9hK6ZSn/supabase-logo-icon.png" alt="Supabase" width="32" height="32"></a>
&nbsp;
<a href="https://reactrouter.com/" target="_blank" title="React Router"><img src="https://i.ibb.co/zTzh8rCd/react-router-logo-light.png" alt="React Router" width="32" height="32"></a>
&nbsp;
<a href="https://vitest.dev/" target="_blank" title="Vitest"><img src="https://i.ibb.co/99zTCxvx/vitest.png" alt="Vitest" width="32" height="32"></a>
&nbsp;
<a href="https://testing-library.com/" target="_blank" title="React Testing Library"><img src="https://i.ibb.co/YLnX0VY/octopus-64x64.png" alt="React Testing Library" width="32" height="32"></a>

<div style="display: flex; justify-content: center; gap: 8px;">

[![RelativeCI](https://badges.relative-ci.com/badges/ZMp2Jc2sGq2jCm6ArH0A?branch=main&style=flat)](https://app.relative-ci.com/projects/ZMp2Jc2sGq2jCm6ArH0A)

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/domhhv/habitrack?utm_source=oss&utm_medium=github&utm_campaign=domhhv%2Fhabitrack&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

</div>

</div>

Habitrack is a simple and intuitive web app designed for logging habits and v isualizing them on a calendar view.

This app showcases the use of the following tools and technologies:

- React 19 with TypeScript 5.9, bundled with [Vite 7](https://vite.dev/)
- [React Router](https://reactrouter.com) v7 for routing (declarative mode)
- [Zustand](https://zustand.docs.pmnd.rs/) v5 for global state management
- [Tailwind CSS](https://tailwindcss.com) v4 for styling
- [HeroUI](https://www.heroui.com/) for the UI components
- React Aria [calendar hooks](https://react-spectrum.adobe.com/react-aria/useCalendar.html) to generate the calendar view
- [Supabase](https://supabase.io) for Authentication, Database and Storage
- [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) for unit-testing
- ESLint, Prettier, Husky, and SQLFluff for linting and formatting
- Docker for running a local Supabase instance
- GitHub Actions for CI/CD and Vercel for deployment

## Features

- **Customizable Habits**: Add, remove, and customize habits to fit your routine. Associate your habits with traits and icons.
- **Calendar View**: Visualize your habits on a monthly calendar.
- **Daily Tracking**: Easily add daily entries of your habits.
- **User Authentication**: Sign up and log in to your account to retain your habits and entries.'
- **Responsive Design**: Enjoy a seamless experience on any device.
- **PWA**: Install the app on your device for quick access.

## Roadmap

- [x] **Dark Mode**: Switch between light and dark themes.
- [x] **Weekly View (in progress)**: View your habits on a weekly calendar.
- [x] **Daily View**: Dive into your habits on a daily calendar.
- [ ] **Export**: Export your habits and entries.
- [ ] **Categories**: Group habits into categories.
- [ ] **Environments**: Associate habits with environments where they occur.
- [ ] **Habit Presets**: Use predefined habit templates for quick setup.
- [ ] **Log Presets**: Create and use log entry presets for faster logging.
- [ ] **Statistics**: Track your progress with insightful statistics.
- [ ] **Enriched Habit Streaks**: Extended options to visualize and track habit streaks (basic one-off streaks are displayed under /habits).
- [ ] **Sharing**: Share your calendar with trusted people.
- [ ] **Group Calendars**: Form or break habits together with friends or under a supervision of a coach.
- [ ] **Group Challenges**: Participate in habit challenges within groups.
- [ ] **Notifications**: Get reminders to log your habits via PWA notifications and later via email.
- [ ] **Offline Support**: Use the app without an internet connection.

### Tech Debt

- [x] **Migrate to Vitest**: Replace Jest with Vitest.
- [x] **Migrate to ESLint v9**: Update to ESLint v9 and use flat config.
- [ ] **Migrate to HeroUI 3**: Update to [HeroUI v3](https://v3.heroui.com/) (currently in beta) once it reaches stable release.

## Local development

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/) (22.22.0)
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) (v2)
- [Docker](https://docs.docker.com/get-started/get-docker/)
- Yarn is used as a package manager and is automatically available via Corepack (bundled with Node.js)

### Initial Setup

Follow these steps to get the project up and running on your local machine.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/domhhv/habitrack.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd habitrack
   ```

3. **Install dependencies:**

   ```bash
   yarn install
   ```

### Local Database Setup

The project uses Supabase for database operations.

The Supabase project configuration, seeds and migrations live under the `supabase` directory.

To set up a local Supabase instance, run the following commands (Docker required).

1. **Start the local Supabase instance:**

   ```bash
   yarn db:start
   # API URL: http://127.0.0.1:54321
   # DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
   # Studio URL: http://127.0.0.1:54323
   # anon key: <your-anon-key>
   # ...
   ```

   This command starts Supabase Docker containers based on `supabase/config.toml` and creates a local Postgres database and services.

   It should output the API URL, DB URL, Studio URL, and an anonymous key, among other info. Use the Studio URL to access the local Supabase dashboard in the browser, and DB URL to connect to the local database directly.

   API URL and anon key are needed in the next step to set up the local environment variables.

2. **Environment variables**

   Create a `.env.development` file in the root directory of the project and add the following environment variables:

   ```
   SUPABASE_URL=<API URL>
   SUPABASE_ANON_KEY=<anon key>
   ```

3. **Apply migrations and seed the database:**

   ```bash
   yarn db:reset
   ```

   This command resets the local database to a clean state, applies migrations from `supabase/migrations` and seeds the db with essential initial data based on `supabase/seed.sql`.

### Run the app

Once the dependencies are installed and the local Supabase instance is running, you can run the app locally:

```bash
yarn dev
```

This command starts the development server and opens the app in your default browser.

### Database Migrations

There are a few ways to create and run migrations in the project.

- **[Recommended] Change or create [declarative database schema](https://supabase.com/docs/guides/local-development/declarative-database-schemas) SQL files under `supabase/schemas` directory as needed**

This project uses declarative database schema management, so the preferred way to make changes to the database schema is to modify the SQL files under `supabase/schemas` directory.

If you need to modify an existing table, add a new table/type/function, or make any other schema changes, do so by editing or adding SQL files in the `supabase/schemas` directory, then run:

```bash
yarn db:diff -f <your-migration-name>
```

- **Diffing the Supabase Studio database schema changes to automatically generate a new migration file**

Do the necessary changes in the local Supabase studio and then run the following to automatically generate a new migration file:

```bash
yarn db:diff -f <your-migration-name>
```

- **Creating a new migration file manually**

To create a new migration file manually, run the following command:

```bash
yarn db:migration:new <your-migration-name>
```

---

Either way, the new migration file will be created in the `supabase/migrations` directory. Write/change the SQL queries in the migration file to reflect the changes you want to make to the database schema. Then, apply the migration by running:

```bash
yarn db:migration:up # or
yarn db:reset # to reset the local DB and apply all migrations
```

After applying the migration, you also need to regenerate Supabase types by running:

```bash
yarn db:gen-types
```

Once the migration ends up in the `main` branch, it will be automatically applied to the production database.

> Important step: After applying any new migrations, always remember to regenerate Supabase types by running `yarn db:gen-types` to keep the types in sync with the database schema.

### Testing

The project uses [Vitest](https://vitest.dev/) as the test runner and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) for unit testing of React components.

To run the tests, use the following command:

```bash
yarn test
```

Other test-related commands include:

```bash
yarn test:coverage # Run all tests and generate coverage report
yarn test:watch # Run all tests in watch mode
yarn test:no-cache # Run all tests without cache
```

### Linting

There are two types of linting in the project: JavaScript/TypeScript linting and SQL linting.

#### JS/TS

The project uses [ESLint](https://eslint.org/) v9 with a custom flat config for linting. To run ESLint, use the following command:

```bash
yarn eslint:check # Check for linting errors
yarn eslint:fix # Fix linting errors
```

#### SQL

In addition to ESLint, the project uses [SQLFluff](https://docs.sqlfluff.com/en/stable/) for linting SQL queries under `supabase` directory. To run SQLFluff (Docker required), use the following command:

```bash
yarn lint:sql # Lint SQL queries
yarn fix:sql # Find fixable linting violations in SQL queries and apply fixes
```

### Formatting

The project uses [Prettier](https://prettier.io/) for formatting. To run Prettier, use the following command:

```bash
yarn prettier:check # Check for formatting errors
yarn prettier:write # Fix formatting errors
```

### Building

To create a local production-like build of the app, run the following command:

```bash
yarn build
```

You can run the production build locally using the following command:

```bash
yarn preview
```

## CI/CD

The project uses GitHub Actions for CI/CD.

### Pull Requests

When you open a pull request, the following checks are run:

- **Setup**: Install and cache Yarn dependencies.
- **Typecheck**: Run TypeScript type checks.
- **ESLint**: Run ESLint checks for JS/TS lint issues.
- **SQLFluff**: Run SQLFluff checks for SQL lint issues.
- **Prettier**: Run Prettier checks for formatting issues.
- **Unit tests**: Run unit tests with Vitest (currently not required to pass as tests are incomplete).
- **RelativeCI**: Visual regression tests powered by RelativeCI.
- **Deploy preview**: Build and deploy the app to Vercel for preview.
- **Coderabbit PR Review**: Automated code review powered by CodeRabbit.

All checks but the last one must pass before merging a pull request.

### Merging to Main

When a pull request is merged to the `main` branch, the following checks are run:

- **Deploy app**: Build and deploy the app to Vercel.
- **Migrate database**: Apply Supabase migrations to the production database, if any.

## Contributing

Contributions are welcome! Feel free to open issues or pull requests for any improvements, bug fixes, or new features.
