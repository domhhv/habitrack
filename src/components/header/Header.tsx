import { Button, Tooltip, Spinner } from '@heroui/react';
import { Repeat, GithubLogo, CalendarDots } from '@phosphor-icons/react';
import React from 'react';
import { Link } from 'react-router';

import { AuthModalButton } from '@components';
import { useUser, useScreenWidth, useFetchOnAuth } from '@hooks';

import ThemeToggle from './ThemeToggle';

const Header = () => {
  useFetchOnAuth();
  const { isDesktop, isMobile, screenWidth } = useScreenWidth();
  const { isLoading } = useUser();

  return (
    <>
      {isLoading && (
        <div className="absolute bottom-0 left-0 right-0 top-0 z-50 flex h-full flex-1 items-center justify-center bg-background-100 opacity-90 dark:bg-background-800">
          <div className="flex -translate-y-[73px] items-center justify-center">
            <Spinner
              size="lg"
              color="primary"
              label="Please wait"
              labelColor="primary"
            />
          </div>
        </div>
      )}
      <header className="border-b border-b-slate-300 bg-background-100 dark:border-b-slate-800 dark:dark:bg-background-900">
        <div className="mx-auto flex w-full items-center justify-between gap-2 px-8 py-2 lg:gap-4 lg:px-16 lg:py-4">
          <div className="flex items-center gap-2">
            <Button
              as={Link}
              color="primary"
              to="/calendar/month"
              isIconOnly={screenWidth < 372}
              size={isDesktop ? 'md' : 'sm'}
              className={screenWidth < 339 ? 'min-w-fit px-2' : ''}
            >
              {screenWidth < 372 ? (
                <CalendarDots size={16} weight="bold" />
              ) : (
                'Calendar'
              )}
            </Button>
            <Button
              as={Link}
              to="/habits"
              color="secondary"
              isIconOnly={screenWidth < 372}
              size={isDesktop ? 'md' : 'sm'}
            >
              {screenWidth < 372 ? (
                <Repeat size={16} weight="bold" />
              ) : (
                'Habits'
              )}
            </Button>
            <ThemeToggle />
            {!isMobile && (
              <Tooltip
                showArrow
                delay={1000}
                color="secondary"
                placement="right"
                content="View source code on GitHub"
              >
                <Button
                  as={Link}
                  isIconOnly
                  variant="light"
                  target="_blank"
                  color="secondary"
                  size={isDesktop ? 'md' : 'sm'}
                  to="https://github.com/domhhv/habitrack"
                >
                  <GithubLogo size={isDesktop ? 20 : 16} />
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
