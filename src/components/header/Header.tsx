import { cn, Kbd, Button, Tooltip } from '@heroui/react';
import { today, getLocalTimeZone } from '@internationalized/date';
import {
  NoteIcon,
  RepeatIcon,
  GithubLogoIcon,
  NotePencilIcon,
  CalendarDotsIcon,
  CalendarCheckIcon,
  ArrowSquareOutIcon,
} from '@phosphor-icons/react';
import { Link, useLocation } from 'react-router';

import { AuthModalButton } from '@components';
import { useScreenWidth, useHasKeyboard, useKeyboardShortcut } from '@hooks';
import { useNoteDrawerActions, useOccurrenceDrawerActions } from '@stores';

import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { isDesktop, screenWidth } = useScreenWidth();
  const { pathname } = useLocation();
  const { openNoteDrawer } = useNoteDrawerActions();
  const { openOccurrenceDrawer } = useOccurrenceDrawerActions();
  const hasKeyboard = useHasKeyboard();

  const dispatchNoteDrawerOpen = () => {
    openNoteDrawer(today(getLocalTimeZone()), 'day');
  };

  const dispatchOccurrenceDrawerOpen = () => {
    openOccurrenceDrawer({
      dayToLog: today(getLocalTimeZone()),
    });
  };

  useKeyboardShortcut('n', dispatchNoteDrawerOpen);
  useKeyboardShortcut('l', dispatchOccurrenceDrawerOpen);
  useKeyboardShortcut('m', () => {
    window.open('https://habitrack.featurebase.app/roadmap', '_blank');
  });

  return (
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
            className={cn(pathname === '/habits' && 'dark:text-secondary-500')}
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
            {screenWidth < 498 ? <NoteIcon size={16} weight="bold" /> : 'Notes'}
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
                rel="noopener noreferrer"
                to="https://github.com/domhhv/habitrack"
              >
                <GithubLogoIcon size={isDesktop ? 18 : 16} />
              </Button>
            </Tooltip>
          )}
        </div>
        <div className="flex gap-4">
          <div className="bg-background-100/90 dark:bg-background-900 fixed right-0 bottom-0 left-0 z-50 flex w-full gap-4 border-t border-t-slate-300 p-2 px-4 md:right-4 md:bottom-4 md:left-auto md:w-auto md:border-0 md:bg-transparent md:p-0 xl:static xl:right-auto xl:bottom-auto xl:flex-row-reverse xl:border-0 xl:bg-transparent xl:p-0 dark:border-t-slate-800 dark:md:bg-transparent dark:xl:bg-transparent">
            <Button
              size="sm"
              variant="solid"
              color="secondary"
              onPress={dispatchNoteDrawerOpen}
              radius={screenWidth < 768 ? 'full' : 'sm'}
              className="flex-1 max-md:h-6 max-md:gap-1 md:flex-none"
            >
              <NotePencilIcon
                weight="bold"
                size={screenWidth < 768 ? 12 : 16}
              />
              Note
              <Kbd
                className={cn(
                  'bg-secondary-300 dark:bg-secondary-700 text-tiny hidden px-1 py-0 md:text-sm',
                  hasKeyboard && 'block'
                )}
              >
                N
              </Kbd>
            </Button>
            <Button
              size="sm"
              variant="solid"
              color="primary"
              onPress={dispatchOccurrenceDrawerOpen}
              radius={screenWidth < 768 ? 'full' : 'sm'}
              className="flex-1 max-md:h-6 max-md:gap-1 md:flex-none"
            >
              <CalendarCheckIcon
                weight="bold"
                size={screenWidth < 768 ? 12 : 16}
              />
              Log
              <Kbd
                className={cn(
                  'bg-primary-400 dark:bg-primary-700 text-tiny hidden px-1 py-0 md:text-sm',
                  hasKeyboard && 'block'
                )}
              >
                L
              </Kbd>
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button
              as={Link}
              size="sm"
              variant="solid"
              target="_blank"
              color="secondary"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex"
              to="https://habitrack.featurebase.app/roadmap"
            >
              <ArrowSquareOutIcon size={16} weight="bold" />
              Roadmap
              <Kbd
                className={cn(
                  'bg-secondary-300 dark:bg-secondary-700 hidden px-1 py-0',
                  hasKeyboard && 'block'
                )}
              >
                M
              </Kbd>
            </Button>
            <AuthModalButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
