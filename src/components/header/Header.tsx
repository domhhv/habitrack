import { AuthModalButton } from '@components';
import { useScreenSize, useFetchOnAuth } from '@hooks';
import { Button, Tooltip, Spinner } from '@nextui-org/react';
import { GithubLogo } from '@phosphor-icons/react';
import { useSessionContext } from '@supabase/auth-helpers-react';
import React from 'react';
import { Link } from 'react-router-dom';

import ThemeToggle from './ThemeToggle';

const Header = () => {
  useFetchOnAuth();
  const screenSize = useScreenSize();
  const session = useSessionContext();

  return (
    <>
      {session.isLoading && (
        <div className="absolute bottom-0 left-0 right-0 top-0 z-50 flex h-full flex-1 items-center justify-center bg-slate-50 opacity-90 dark:bg-slate-950">
          <div className="flex -translate-y-[73px] items-center justify-center">
            <Spinner
              color="primary"
              size="lg"
              label="Please wait"
              classNames={{
                circle1: 'border-b-white',
                circle2: 'border-b-white',
              }}
            />
          </div>
        </div>
      )}
      <header className="border-b border-b-slate-300 bg-background brightness-[95%] dark:border-b-slate-800 dark:brightness-[90%]">
        <div className="mx-auto flex w-full items-center justify-between gap-2 px-2 py-2 lg:px-16 lg:py-4">
          <div className="flex items-center gap-2">
            <Button
              color="primary"
              as={Link}
              to="/calendar/month"
              size={screenSize > 1024 ? 'md' : 'sm'}
              className={screenSize < 339 ? 'min-w-fit px-2' : ''}
            >
              Calendar
            </Button>
            <Button
              color="primary"
              as={Link}
              to="/habits"
              size={screenSize > 1024 ? 'md' : 'sm'}
              className={screenSize < 339 ? 'min-w-fit px-2' : ''}
            >
              Habits
            </Button>
            <ThemeToggle />
            {screenSize > 768 && (
              <Tooltip
                showArrow
                content="View source code on GitHub"
                delay={1000}
                color="secondary"
                placement="right"
              >
                <Button
                  variant="light"
                  color="secondary"
                  isIconOnly
                  as={Link}
                  to="https://github.com/domhhv/habitrack"
                  target="_blank"
                  className=""
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
    </>
  );
};

export default Header;
