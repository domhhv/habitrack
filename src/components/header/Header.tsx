import { AuthModalButton } from '@components';
import { Button, Tooltip, Spinner } from '@heroui/react';
import { useScreenWidth, useFetchOnAuth, useUser } from '@hooks';
import { CalendarDots, GithubLogo, Repeat } from '@phosphor-icons/react';
import React from 'react';
import { Link } from 'react-router';

import ThemeToggle from './ThemeToggle';

const Header = () => {
  useFetchOnAuth();
  const { screenWidth, isMobile, isDesktop } = useScreenWidth();
  const { isLoading } = useUser();

  return (
    <>
      {isLoading && (
        <div className="absolute bottom-0 left-0 right-0 top-0 z-50 flex h-full flex-1 items-center justify-center bg-background-100 opacity-90 dark:bg-background-800">
          <div className="flex -translate-y-[73px] items-center justify-center">
            <Spinner
              color="primary"
              labelColor="primary"
              size="lg"
              label="Please wait"
            />
          </div>
        </div>
      )}
      <header className="border-b border-b-slate-300 bg-background-100 dark:border-b-slate-800 dark:dark:bg-background-900">
        <div className="mx-auto flex w-full items-center justify-between gap-2 px-8 py-2 lg:gap-4 lg:px-16 lg:py-4">
          <div className="flex items-center gap-2">
            <Button
              isIconOnly={screenWidth < 372}
              color="primary"
              as={Link}
              to="/calendar/month"
              size={isDesktop ? 'md' : 'sm'}
              className={screenWidth < 339 ? 'min-w-fit px-2' : ''}
            >
              {screenWidth < 372 ? (
                <CalendarDots weight="bold" size={16} />
              ) : (
                'Calendar'
              )}
            </Button>
            <Button
              isIconOnly={screenWidth < 372}
              color="secondary"
              as={Link}
              to="/habits"
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
                  size={isDesktop ? 'md' : 'sm'}
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
