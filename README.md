# Habits Calendar Tracker

![Habits Calendar Tracker](https://i.ibb.co/BGYzV8x/Screenshot-2024-01-07-at-17-57-19.png)

This app is designed to provide a simple and intuitive way to monitor habits. Track your habits with ease using this customizable and user-friendly React-based habits calendar tracker.

The app is live [here](https://domhhv.github.io/react-habits-calendar-tracker/). It uses:
- React Aria [calendar hooks](https://react-spectrum.adobe.com/react-aria/useCalendar.html) to generate the calendar view
- [framer-motion](https://www.framer.com/motion/) for animations
- [Material Joy UI](https://mui.com/joy-ui/getting-started/) for the UI and styling solution

## Features

- **Calendar View**: Visualize your habits on a monthly calendar.
- **Customizable Habits**: Add, remove, and customize habits to fit your routine.
- **Daily Tracking**: Easily mark off completed habits on a daily basis.
- **Data Persistence**: Your habit data is saved locally, ensuring it persists between sessions.
- **Responsive Design**: Access your habit tracker seamlessly on various devices.

## Running locally

### Data storage and management

A designated server application was built to handle the backend and database. The code for the server can be found [here](https://github.com/domhhv/nest-habits-calendar-tracker). Follow the instructions in the README to get the server up and running.

Alternatively, you can use your own server and database.

Provide the server URL in the `API_BASE_URL` environment variable in the `.env.development` file.

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

- `API_BASE_URL`: The base URL of the server application. Defaults to `http://localhost:3000` if not provided.
- `NODE_ENV`: The environment the application is running in. Either `development` (for `yarn start`) or `production` (for `yarn build`).

Create a `.env.development` file in the root directory of the project and add the environment variables there. For example:

```bash
API_BASE_URL=http://localhost:3000
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