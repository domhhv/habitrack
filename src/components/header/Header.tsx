import { cn, Kbd, Button, Tooltip, Spinner } from '@heroui/react';
import { today, getLocalTimeZone } from '@internationalized/date';
import {
  NoteIcon,
  RepeatIcon,
  GithubLogoIcon,
  NotePencilIcon,
  CalendarDotsIcon,
} from '@phosphor-icons/react';
import { Link, useLocation } from 'react-router';

import { AuthModalButton } from '@components';
import {
  useUser,
  useScreenWidth,
  useFetchOnAuth,
  useKeyboardShortcut,
} from '@hooks';
import { useNoteDrawerActions } from '@stores';

import ThemeToggle from './ThemeToggle';

const Header = () => {
  useFetchOnAuth();
  const { isDesktop, screenWidth } = useScreenWidth();
  const { isLoading } = useUser();
  const { pathname } = useLocation();
  const { openNoteDrawer } = useNoteDrawerActions();

  const openDrawer = () => {
    openNoteDrawer(today(getLocalTimeZone()), 'day');
  };

  useKeyboardShortcut('n', openDrawer);

  return (
    <>
      {isLoading && (
        <div className="bg-background-100 dark:bg-background-800 absolute top-0 right-0 bottom-0 left-0 z-50 flex h-full flex-1 items-center justify-center opacity-90">
          <div className="flex -translate-y-18.25 items-center justify-center">
            <Spinner
              size="lg"
              color="primary"
              label="Please wait"
              labelColor="primary"
            />
          </div>
        </div>
      )}
      <header className="bg-background-100 dark:dark:bg-background-900 border-b border-b-slate-300 dark:border-b-slate-800">
        <div className="mx-auto flex w-full items-center justify-between gap-2 px-4 py-2 min-[373px]:px-8 lg:gap-4 lg:px-16">
          <div className="flex items-center gap-2">
            <Button
              as={Link}
              size="sm"
              color="secondary"
              to="/calendar/month"
              isIconOnly={screenWidth < 498}
              variant={pathname.startsWith('/calendar') ? 'flat' : 'light'}
              className={cn(
                pathname.startsWith('/calendar') && 'dark:text-secondary-500',
                screenWidth < 339 && 'min-w-fit px-2'
              )}
            >
              {screenWidth < 498 ? (
                <CalendarDotsIcon size={16} weight="bold" />
              ) : (
                'Calendar'
              )}
            </Button>
            <Button
              as={Link}
              size="sm"
              to="/habits"
              color="secondary"
              isIconOnly={screenWidth < 498}
              variant={pathname === '/habits' ? 'flat' : 'light'}
              className={cn(
                pathname === '/habits' && 'dark:text-secondary-500'
              )}
            >
              {screenWidth < 498 ? (
                <RepeatIcon size={16} weight="bold" />
              ) : (
                'Habits'
              )}
            </Button>
            <Button
              as={Link}
              size="sm"
              to="/notes"
              color="secondary"
              isIconOnly={screenWidth < 498}
              variant={pathname === '/notes' ? 'flat' : 'light'}
              className={cn(pathname === '/notes' && 'dark:text-secondary-500')}
            >
              {screenWidth < 498 ? (
                <NoteIcon size={16} weight="bold" />
              ) : (
                'Notes'
              )}
            </Button>
            <ThemeToggle />
            {screenWidth > 390 && (
              <Tooltip
                showArrow
                delay={500}
                closeDelay={0}
                color="secondary"
                placement="right"
                content="View source code on GitHub"
              >
                <Button
                  as={Link}
                  size="sm"
                  isIconOnly
                  variant="light"
                  target="_blank"
                  color="secondary"
                  to="https://github.com/domhhv/habitrack"
                >
                  <GithubLogoIcon size={isDesktop ? 18 : 16} />
                </Button>
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="solid"
              color="secondary"
              onPress={openDrawer}
              className="hidden md:inline-flex"
            >
              <NotePencilIcon size={16} weight="bold" />
              Note
              <Kbd className="bg-secondary-300 hidden px-1 py-0 lg:block">
                N
              </Kbd>
            </Button>
            <AuthModalButton />
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
