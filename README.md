# Habits Calendar Tracker

![Habits Calendar Tracker](https://i.ibb.co/HGKsdk5/screencapture-localhost-8081-calendar-2024-02-23-16-01-26.png)

This app is designed to provide a simple and intuitive way to monitor habits. Track your habits with ease using this customizable and user-friendly React-based habits calendar tracker.

The app is live [here](https://habilify,io). It uses:
- React Aria [calendar hooks](https://react-spectrum.adobe.com/react-aria/useCalendar.html) to generate the calendar view
- [framer-motion](https://www.framer.com/motion/) for animations
- [Material Joy UI](https://mui.com/joy-ui/getting-started/) for the UI and styling solution
- [Supabase](https://supabase.io) for Authentication, Database and Storage

## Features

- **Calendar View**: Visualize your habits on a monthly calendar.
- **Customizable Habits**: Add, remove, and customize habits to fit your routine. Associate your habits with traits and icons.
- **Daily Tracking**: Easily add daily entries of your habits.
- **User Authentication**: Sign up and log in to your account to save your habits and entries.

## Running locally

### Data storage and management

The app uses Supabase for data storage and management. In order to run the app locally, you'll need to set up a Supabase project and provide the necessary environment variables.

1. **Create a Supabase project:**

    - Go to [Supabase](https://supabase.io/) and create an account.
    - Create a new project and database.

2. **Set up the database:**

- Create the following tables with appropriate columns in your Supabase project:
  - `public.traits`:
      - `id` (type: `int8`, primary key)
      - `created_at` (type: `timestamp with time zone`)
      - `updated_at` (type: `timestamp with time zone`)
      - `name` (type: `text`)
      - `slug` (type: `text`)
      - `description` (type: `text`)
      - `user_id` (type: `uuid`, foreign key to `auth.users.id`)
  - `public.habits`:
      - `id` (type: `int8`, primary key)
      - `created_at` (type: `timestamp with time zone`)
      - `updated_at` (type: `timestamp with time zone`)
      - `name` (type: `text`)
      - `description` (type: `text`)
      - `trait_id` (type: `int8`, foreign key to `public.traits`)
      - `icon_path` (type: `text`)
      - `user_id` (type: `uuid`, foreign key to `auth.users.id`)
  - `public.occurrences`:
    - `id` (type: `int8`, primary key)
    - `created_at` (type: `timestamp with time zone`)
    - `updated_at` (type: `timestamp with time zone`)
    - `timestamp` (type: `int8`)
    - `day` (type: `date`)
    - `time` (type: `time with time zone`)
    - `habit_id` (type: `int8`, foreign key to `public.habits`)
    - `user_id` (type: `uuid`, foreign key to `auth.users.id`)
  - `public.accounts`:
      - `id` (type: `uuid`, primary key)
      - `created_at` (type: `timestamp with time zone`)
      - `updated_at` (type: `timestamp with time zone`)
      - `name` (type: `text`)
      - `email` (type: `text`)
      - `phone_number` (type: `text`)

Initially, a designated server application was built to handle the backend and database. The code for the server can be found [here](https://github.com/domhhv/nest-habits-calendar-tracker).

To use it, make sure to `checkout` the commit hash below. Then, follow the instructions in the README to get the server up and running.

```bash
git checkout 8e8740097cdcdb6502a1ae540c13e33e1707aac0
```

Also, set up the necessary environment variables in the `.env.development` file in the client application.

```bash
API_BASE_URL=http://localhost:3000
NODE_ENV=development
```

Alternatively, you can use your own server and database.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v14.17.0 or higher)
- [Yarn](https://yarnpkg.com/) (v1.22.10 or higher)
- [Git](https://git-scm.com/)

### Installation

Follow these steps to get the project up and running on your local machine.

1. **Clone the repository:**

    ```bash
    git clone https://github.com/domhhv/react-habits-calendar-tracker.git
    ```

2. **Navigate to the project directory:**

    ```bash
    cd react-habits-calendar-tracker
    ```

3. **Install dependencies:**

    ```bash
    yarn install
    ```

4. **Run the application:**

    ```bash
    yarn start
    ```

5. **Open your browser and go to [http://localhost:8080](http://localhost:8080).**

### Environment variables

The following environment variables are used in the project:

- `SUPABASE_URL`: The URL of the Supabase project.
- `SUPABASE_ANON_KEY`: The anonymous key of the Supabase project.
- `NODE_ENV`: The environment the application is running in. Either `development` (for `yarn start`) or `production` (for `yarn build`).

Create a `.env.development` file in the root directory of the project and add the environment variables there. For example:

```bash
SUPABASE_URL=https://<your-supabase-url>.supabase.co
SUPABASE_ANON_KEY=<your-supabase-anon-key>
NODE_ENV=development
```

### Testing

The project uses [Jest](https://jestjs.io/) for testing. To run the tests, use the following command:

```bash
yarn test
```

To run the tests with coverage, use the following command:

```bash
yarn test:coverage
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
