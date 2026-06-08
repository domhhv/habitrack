import { cn, Button, Tooltip } from '@heroui/react';
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
import { useLocation, useNavigate } from 'react-router';

import { Kbd, AuthModalButton } from '@components';
import { useScreenWidth } from '@hooks';
import {
  useUser,
  useNoteDrawerActions,
  useOccurrenceDrawerActions,
} from '@stores';

import ThemeToggle from './ThemeToggle';

const ICON_ONLY_BREAKPOINT = 521;
const COMPACT_BUTTON_BREAKPOINT = 339;

const Header = () => {
  const user = useUser();
  const navigate = useNavigate();
  const { isDesktop, isMobile, screenWidth } = useScreenWidth();
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
    <nav className="bg-background-100 dark:bg-background-900 sticky top-0 z-50 h-16 w-full border-b border-b-slate-300 dark:border-b-slate-800">
      <header className="flex h-full w-full items-center justify-between px-8 lg:px-16">
        <div className="flex items-center gap-2">
          <Button
            isIconOnly={screenWidth < ICON_ONLY_BREAKPOINT}
            variant={pathname.startsWith('/calendar') ? 'tertiary' : 'ghost'}
            onPress={() => {
              navigate('/calendar/month');
            }}
            className={cn(
              screenWidth < COMPACT_BUTTON_BREAKPOINT && 'min-w-fit px-2'
            )}
          >
            {screenWidth < ICON_ONLY_BREAKPOINT ? (
              <CalendarDotsIcon size={16} />
            ) : (
              'Calendar'
            )}
          </Button>
          {!!user && (
            <>
              <Button
                isIconOnly={screenWidth < ICON_ONLY_BREAKPOINT}
                variant={pathname === '/habits' ? 'tertiary' : 'ghost'}
                onPress={() => {
                  navigate('/habits');
                }}
              >
                {screenWidth < ICON_ONLY_BREAKPOINT ? (
                  <RepeatIcon size={16} />
                ) : (
                  'Habits'
                )}
              </Button>
              <Button
                isIconOnly={screenWidth < ICON_ONLY_BREAKPOINT}
                variant={pathname === '/notes' ? 'tertiary' : 'ghost'}
                onPress={() => {
                  navigate('/notes');
                }}
                className={cn(
                  pathname === '/notes' && 'dark:text-secondary-500'
                )}
              >
                {screenWidth < ICON_ONLY_BREAKPOINT ? (
                  <NoteIcon size={16} />
                ) : (
                  'Notes'
                )}
              </Button>
            </>
          )}
          <ThemeToggle />
          {screenWidth > 390 && (
            <Tooltip closeDelay={0}>
              <Tooltip.Trigger>
                <Button
                  isIconOnly
                  variant="ghost"
                  onPress={() => {
                    window.open(
                      'https://github.com/domhhv/habitrack',
                      '_blank',
                      'noopener,noreferrer'
                    );
                  }}
                >
                  <GithubLogoIcon size={isDesktop ? 18 : 16} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content showArrow offset={10} placement="bottom">
                <Tooltip.Arrow />
                View source code on GitHub
              </Tooltip.Content>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-4">
          {!!user && (
            <div className="bg-background-100/90 dark:bg-background-900 fixed right-0 bottom-0 left-0 z-50 flex w-full gap-4 border-t border-t-slate-300 p-2 px-4 md:right-4 md:bottom-4 md:left-auto md:w-auto md:border-0 md:bg-transparent md:p-0 xl:static xl:right-auto xl:bottom-auto xl:flex-row-reverse xl:border-0 xl:bg-transparent xl:p-0 dark:border-t-slate-800 dark:md:bg-transparent dark:xl:bg-transparent">
              <Button
                variant="secondary"
                fullWidth={isMobile}
                onPress={dispatchNoteDrawerOpen}
                className="flex-1 max-md:h-6 max-md:gap-1 max-md:rounded-full md:flex-none"
              >
                <NotePencilIcon size={isMobile ? 12 : 16} />
                Note
                <Kbd
                  isSolid
                  variant="light"
                  size={isMobile ? 'sm' : 'md'}
                  shortcutParams={['n', dispatchNoteDrawerOpen]}
                >
                  N
                </Kbd>
              </Button>
              <Button
                variant="primary"
                fullWidth={isMobile}
                onPress={dispatchOccurrenceDrawerOpen}
                className="flex-1 max-md:h-6 max-md:gap-1 max-md:rounded-full md:flex-none"
              >
                <CalendarCheckIcon size={isMobile ? 12 : 16} />
                Log
                <Kbd
                  variant="default"
                  size={isMobile ? 'sm' : 'md'}
                  shortcutParams={['l', dispatchOccurrenceDrawerOpen]}
                >
                  L
                </Kbd>
              </Button>
            </div>
          )}
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              className="hidden xl:inline-flex"
              onPress={() => {
                window.open(
                  'https://habitrack.featurebase.app/roadmap',
                  '_blank',
                  'noopener,noreferrer'
                );
              }}
            >
              <ArrowSquareOutIcon size={16} />
              Roadmap
              <Kbd
                isSolid
                size="md"
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
            <AuthModalButton />
          </div>
        </div>
      </header>
    </nav>
  );
};

export default Header;
