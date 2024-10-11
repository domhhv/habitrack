<h1 align="center">Habitrack</h1>

Habitrack is a simple and intuitive app designed to help users build better habits by visualizing their progress on a calendar. With Habitrack, you can easily log daily habits, track your consistency, and see your streaks at a glance. This tool is perfect for anyone looking to stay motivated and committed to personal goals, whether it’s fitness, learning, or self-improvement. By providing a clear overview of your habit performance over time, Habitrack helps you stay on course and maintain accountability.

The app is live [here]([https://habitrack.io]). It uses:

- React Aria [calendar hooks](https://react-spectrum.adobe.com/react-aria/useCalendar.html) to generate the calendar view
- [NextUI](https://nextui.org) for the UI components
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Supabase](https://supabase.io) for Authentication, Database and Storage

## Features

- **Calendar View**: Visualize your habits on a monthly calendar.
- **Customizable Habits**: Add, remove, and customize habits to fit your routine. Associate your habits with traits and icons.
- **Daily Tracking**: Easily add daily entries of your habits.
- **User Authentication**: Sign up and log in to your account to retain your habits and entries.

_This app is under active development. More features coming soon!_

## Local development

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/) (LTS)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install) (latest Classic Stable release or higher)
- [Docker](https://docs.docker.com/get-started/get-docker/) (optional, for running a local Supabase instance)

### Installation

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

4. **Run the application:**

   ```bash
   yarn dev
   ```

   This command starts the development server and opens the app in your default browser.

#### Database setup

The project uses Supabase for database operations. Habitrack UI is still runnable locally without a Supabase instance, but you won't be able to sign in/up or retain your habits and entries.

The Supabase project configuration, seeds and migrations live under the `supabase` directory.

To set up a local Supabase instance, run the following commands (Docker required).

1. **Start the local Supabase instance:**

   ```bash
   yarn db:start
   # API URL: http://127.0.0.1:54321
   # DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
   # Studio URL: http://127.0.0.1:54323
   # anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
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

4. **Check status of the local Supabase instance:**

   ```bash
   yarn db:status
   # the same output as when starting the local Supabase instance
   ```

5. **Stop the local Supabase instance:**

   ```bash
   yarn db:stop
   ```

### Testing

The project uses [Jest](https://jestjs.io/) for unit testing. To run the tests, use the following command:

```bash
yarn test
```

Other test related commands include:

```bash
yarn test:coverage # Run all tests and generate coverage report
yarn test:watch # Run all tests in watch mode
yarn test:clear-cache # Clear Jest cache
```

### Linting

The project uses [ESLint](https://eslint.org/) for linting. To run ESLint, use the following command:

```bash
yarn eslint:check # Check for linting errors
yarn eslint:fix # Fix linting errors
```

### Formatting

The project uses [Prettier](https://prettier.io/) for formatting. To run Prettier, use the following command:

```bash
yarn prettier:check # Check for formatting errors
yarn prettier:fix # Fix formatting errors
```

## Contributing

Contributions are welcome! Feel free to open issues or pull requests for any improvements, bug fixes, or new features.
