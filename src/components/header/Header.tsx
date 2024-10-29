import { AuthModalButton } from '@components';
import { useFetchOnAuth, useScreenSize } from '@hooks';
import { Button, Tooltip } from '@nextui-org/react';
import { GithubLogo } from '@phosphor-icons/react';
import React from 'react';
import { Link } from 'react-router-dom';

import ThemeToggle from './ThemeToggle';

const Header = () => {
  useFetchOnAuth();
  const screenSize = useScreenSize();

  return (
    <header className="border-b border-b-neutral-300 bg-neutral-200 dark:border-b-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto flex w-full items-center justify-between gap-2 px-2 py-2 lg:px-16 lg:py-4">
        <div className="flex items-center gap-2">
          <Button
            color="primary"
            as={Link}
            to="/calendar"
            size={screenSize > 1024 ? 'md' : 'sm'}
          >
            Calendar
          </Button>
          <Button
            color="primary"
            as={Link}
            to="/habits"
            size={screenSize > 1024 ? 'md' : 'sm'}
          >
            Habits
          </Button>
          <ThemeToggle />
          {screenSize > 768 && (
            <Tooltip
              showArrow
              content="View source code on GitHub"
              delay={1000}
              color="primary"
              placement="right"
            >
              <Button
                variant="light"
                color="secondary"
                isIconOnly
                as={Link}
                to="https://github.com/domhhv/habitrack"
                target="_blank"
                className="text-slate-500 hover:!bg-blue-500 hover:text-white dark:text-slate-400 dark:hover:!bg-blue-500 dark:hover:text-white"
                size={screenSize > 1024 ? 'md' : 'sm'}
              >
                <GithubLogo size={screenSize > 1024 ? 20 : 16} />
              </Button>
            </Tooltip>
          )}
        </div>
        <AuthModalButton />
      </div>
    </header>
  );
};

export default Header;
