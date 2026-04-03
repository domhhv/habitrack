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
import { useNoteDrawerActions, useOccurrenceDrawerActions } from '@stores';

import ThemeToggle from './ThemeToggle';

const Header = () => {
  const navigate = useNavigate();
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
    <nav className="bg-background-100 dark:bg-background-900 sticky top-0 z-50 h-12 w-full border-b border-b-slate-300 dark:border-b-slate-800">
      <header className="flex h-full w-full items-center justify-between px-8 lg:px-16">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            isIconOnly={screenWidth < 498}
            variant={pathname.startsWith('/calendar') ? 'secondary' : 'ghost'}
            onPress={() => {
              navigate('/calendar/month');
            }}
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
            size="sm"
            isIconOnly={screenWidth < 498}
            variant={pathname === '/habits' ? 'secondary' : 'ghost'}
            onPress={() => {
              navigate('/habits');
            }}
            className={cn(pathname === '/habits' && 'dark:text-secondary-500')}
          >
            {screenWidth < 498 ? (
              <RepeatIcon size={16} weight="bold" />
            ) : (
              'Habits'
            )}
          </Button>
          <Button
            size="sm"
            isIconOnly={screenWidth < 498}
            variant={pathname === '/notes' ? 'secondary' : 'ghost'}
            onPress={() => {
              navigate('/notes');
            }}
            className={cn(pathname === '/notes' && 'dark:text-secondary-500')}
          >
            {screenWidth < 498 ? <NoteIcon size={16} weight="bold" /> : 'Notes'}
          </Button>
          <ThemeToggle />
          {screenWidth > 390 && (
            <Tooltip delay={500} closeDelay={0}>
              <Tooltip.Trigger>
                <Button
                  size="sm"
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
              <Tooltip.Content placement="right">
                View source code on GitHub
              </Tooltip.Content>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-background-100/90 dark:bg-background-900 fixed right-0 bottom-0 left-0 z-50 flex w-full gap-4 border-t border-t-slate-300 p-2 px-4 md:right-4 md:bottom-4 md:left-auto md:w-auto md:border-0 md:bg-transparent md:p-0 xl:static xl:right-auto xl:bottom-auto xl:flex-row-reverse xl:border-0 xl:bg-transparent xl:p-0 dark:border-t-slate-800 dark:md:bg-transparent dark:xl:bg-transparent">
            <Button
              size="sm"
              variant="secondary"
              fullWidth={screenWidth < 768}
              onPress={dispatchNoteDrawerOpen}
              className={cn(
                'flex-1 max-md:h-6 max-md:gap-1 md:flex-none',
                screenWidth < 768 ? 'rounded-full' : 'rounded-sm'
              )}
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
            <Button
              size="sm"
              variant="primary"
              fullWidth={screenWidth < 768}
              onPress={dispatchOccurrenceDrawerOpen}
              className={cn(
                'flex-1 max-md:h-6 max-md:gap-1 md:flex-none',
                screenWidth < 768 ? 'rounded-full' : 'rounded-sm'
              )}
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
          </div>
          <div className="flex items-center gap-4">
            <Button
              size="sm"
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
            <AuthModalButton />
          </div>
        </div>
      </header>
    </nav>
  );
};

export default Header;
