import { AuthModalButton } from '@components';
import { Button } from '@nextui-org/react';
import React from 'react';
import { Link } from 'react-router-dom';

import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <header className="border-b border-b-neutral-300 bg-neutral-200 dark:border-b-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto flex w-full flex-col items-center justify-between gap-2 p-4 sm:flex-row sm:gap-0 lg:w-[90%]">
        <div className="flex flex-col-reverse items-center gap-3 sm:flex-row">
          <Button color="primary" as={Link} to="/calendar">
            Calendar
          </Button>
          <Button color="primary" as={Link} to="/habits">
            Habits
          </Button>
          <ThemeToggle />
        </div>
        <AuthModalButton />
      </div>
    </header>
  );
};

export default Header;
