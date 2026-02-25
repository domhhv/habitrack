import {
  cn,
  Button,
  Navbar,
  Tooltip,
  NavbarItem,
  NavbarContent,
} from '@heroui/react';
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

import { Kbd, AuthModalButton } from '@components';
import { useScreenWidth } from '@hooks';
import { useNoteDrawerActions, useOccurrenceDrawerActions } from '@stores';

import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { isDesktop, screenWidth } = useScreenWidth();
  const { pathname } = useLocation();
  const { openNoteDrawer } = useNoteDrawerActions();
  const { openOccurrenceDrawer } = useOccurrenceDrawerActions();

  const dispatchNoteDrawerOpen = () => {
    openNoteDrawer(today(getLocalTimeZone()), 'day');
  };

  const dispatchOccurrenceDrawerOpen = () => {
    openOccurrenceDrawer({
      dayToLog: today(getLocalTimeZone()),
    });
  };

  return (
    <Navbar
      isBordered
      height="3rem"
      maxWidth="full"
      isBlurred={false}
      className="bg-background-100 dark:dark:bg-background-900 [&>header]:static [&>header]:lg:px-16"
    >
      <NavbarContent justify="start" className="flex items-center gap-2">
        <NavbarItem>
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
        </NavbarItem>
        <NavbarItem>
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
        </NavbarItem>
        <NavbarItem>
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
        </NavbarItem>
        <NavbarItem>
          <ThemeToggle />
        </NavbarItem>
        {screenWidth > 390 && (
          <Tooltip
            showArrow
            delay={500}
            closeDelay={0}
            color="secondary"
            placement="right"
            content="View source code on GitHub"
          >
            <NavbarItem>
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
            </NavbarItem>
          </Tooltip>
        )}
      </NavbarContent>
      <NavbarContent justify="end">
        <div className="bg-background-100/90 dark:bg-background-900 fixed right-0 bottom-0 left-0 z-50 flex w-full gap-4 border-t border-t-slate-300 p-2 px-4 md:right-4 md:bottom-4 md:left-auto md:w-auto md:border-0 md:bg-transparent md:p-0 xl:static xl:right-auto xl:bottom-auto xl:flex-row-reverse xl:border-0 xl:bg-transparent xl:p-0 dark:border-t-slate-800 dark:md:bg-transparent dark:xl:bg-transparent">
          <NavbarItem className="flex-1 md:flex-none">
            <Button
              size="sm"
              variant="solid"
              color="secondary"
              fullWidth={screenWidth < 768}
              onPress={dispatchNoteDrawerOpen}
              className="max-md:h-6 max-md:gap-1"
              radius={screenWidth < 768 ? 'full' : 'sm'}
            >
              <NotePencilIcon
                weight="bold"
                size={screenWidth < 768 ? 12 : 16}
              />
              Note
              <Kbd
                color="secondary"
                shortcutParams={['n', dispatchNoteDrawerOpen]}
              >
                N
              </Kbd>
            </Button>
          </NavbarItem>
          <NavbarItem className="flex-1 md:flex-none">
            <Button
              size="sm"
              variant="solid"
              color="primary"
              fullWidth={screenWidth < 768}
              className="max-md:h-6 max-md:gap-1"
              onPress={dispatchOccurrenceDrawerOpen}
              radius={screenWidth < 768 ? 'full' : 'sm'}
            >
              <CalendarCheckIcon
                weight="bold"
                size={screenWidth < 768 ? 12 : 16}
              />
              Log
              <Kbd
                color="primary"
                shortcutParams={['l', dispatchOccurrenceDrawerOpen]}
              >
                L
              </Kbd>
            </Button>
          </NavbarItem>
        </div>
        <div className="flex items-center gap-4">
          <NavbarItem>
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
                color="secondary"
                shortcutParams={[
                  'm',
                  () => {
                    window.open(
                      'https://habitrack.featurebase.app/roadmap',
                      '_blank',
                      'noopener,noreferrer'
                    );
                  },
                ]}
              >
                M
              </Kbd>
            </Button>
          </NavbarItem>
          <NavbarItem>
            <AuthModalButton />
          </NavbarItem>
        </div>
      </NavbarContent>
    </Navbar>
  );
};

export default Header;
