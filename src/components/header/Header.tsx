import { AuthModalButton } from '@components';
import { useFetchOnAuth } from '@hooks';
import { Button, Tooltip } from '@nextui-org/react';
import { GithubLogo } from '@phosphor-icons/react';
import React from 'react';
import { Link } from 'react-router-dom';

import ThemeToggle from './ThemeToggle';

const Header = () => {
  useFetchOnAuth();

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
          <Tooltip
            showArrow
            content="View source code on GitHub"
            delay={1000}
            color="primary"
            placement="right"
          >
            <Button
              variant="light"
              isIconOnly
              as={Link}
              to="https://github.com/domhhv/habitrack"
              target="_blank"
              className="text-slate-500 hover:!bg-blue-500 hover:text-white dark:text-slate-400 dark:hover:!bg-blue-500 dark:hover:text-white"
            >
              <GithubLogo size={20} />
            </Button>
          </Tooltip>
        </div>
        <AuthModalButton />
      </div>
    </header>
  );
};

export default Header;
