import { AuthModalButton } from '@components';
import { Button } from '@nextui-org/react';
import React from 'react';
import { Link } from 'react-router-dom';

import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <header className="border-b border-b-neutral-400 bg-neutral-300 dark:border-b-neutral-700 dark:bg-neutral-900">
      <div className="mx-auto flex w-full flex-col items-center justify-between gap-2 p-4 md:flex-row md:gap-0 lg:w-[90%]">
        <div className="flex items-center gap-3">
          <Button color="primary">
            <Link to="/calendar">Calendar</Link>
          </Button>
          <Button color="primary">
            <Link to="/habits">Habits</Link>
          </Button>
          <ThemeToggle />
        </div>
        <AuthModalButton />
      </div>
    </header>
  );
};

export default Header;
