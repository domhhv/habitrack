import { Tooltip } from '@heroui/react';
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
import { useLocation } from 'react-router';

import { CustomKbd, CustomButton, AuthModalButton } from '@components';
import { useScreenWidth } from '@hooks';
import {
  useUser,
  useNoteDrawerActions,
  useOccurrenceDrawerActions,
} from '@stores';

import ThemeToggle from './ThemeToggle';

const Header = () => {
  const user = useUser();
  const { isDesktop, isMobile } = useScreenWidth();
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
    <nav className="bg-background border-border sticky top-0 z-50 h-16 w-full border-b">
      <header className="flex h-full w-full items-center justify-between px-8 lg:px-16">
        <div className="flex items-center gap-2">
          <CustomButton
            href="/calendar/month"
            size={isMobile ? 'sm' : 'md'}
            aria-label='Go to "Calendar" page'
            variant={pathname.startsWith('/calendar') ? 'outline' : 'ghost'}
          >
            <CalendarDotsIcon size={16} className="sm:hidden" />
            <span className="max-sm:hidden">Calendar</span>
          </CustomButton>
          {!!user && (
            <>
              <CustomButton
                href="/habits"
                size={isMobile ? 'sm' : 'md'}
                aria-label='Go to "Habits" page'
                variant={pathname === '/habits' ? 'outline' : 'ghost'}
              >
                <RepeatIcon size={16} className="sm:hidden" />
                <span className="max-sm:hidden">Habits</span>
              </CustomButton>
              <CustomButton
                href="/notes"
                aria-label='Go to "Notes" page'
                variant={pathname === '/notes' ? 'outline' : 'ghost'}
              >
                <NoteIcon size={16} className="sm:hidden" />
                <span className="max-sm:hidden">Notes</span>
              </CustomButton>
            </>
          )}
          <ThemeToggle />
          <Tooltip closeDelay={0}>
            <Tooltip.Trigger>
              <CustomButton
                variant="ghost"
                target="_blank"
                rel="noopener noreferrer"
                className="max-sm:hidden"
                aria-label="View source code on GitHub"
                href="https://github.com/domhhv/habitrack"
              >
                <GithubLogoIcon size={isDesktop ? 18 : 16} />
              </CustomButton>
            </Tooltip.Trigger>
            <Tooltip.Content showArrow offset={10} placement="bottom">
              <Tooltip.Arrow />
              View source code on GitHub
            </Tooltip.Content>
          </Tooltip>
        </div>
        <div className="flex items-center gap-4">
          {!!user && (
            <div className="bg-background-secondary fixed right-0 bottom-0 left-0 z-50 flex w-full gap-4 border-t border-t-slate-300 p-2 px-4 md:right-4 md:bottom-4 md:left-auto md:w-auto md:border-0 md:bg-transparent md:p-0 xl:static xl:right-auto xl:bottom-auto xl:flex-row-reverse xl:border-0 xl:bg-transparent xl:p-0 dark:border-t-slate-800 dark:md:bg-transparent dark:xl:bg-transparent">
              <CustomButton
                variant="bordered"
                fullWidth={isMobile}
                onPress={dispatchNoteDrawerOpen}
                className="flex-1 max-md:h-8 max-md:gap-1 max-md:rounded-full md:flex-none"
              >
                <NotePencilIcon size={isMobile ? 12 : 16} />
                Note
                <CustomKbd
                  isSolid
                  variant="light"
                  size={isMobile ? 'sm' : 'md'}
                  shortcutParams={['n', dispatchNoteDrawerOpen]}
                >
                  N
                </CustomKbd>
              </CustomButton>
              <CustomButton
                variant="primary"
                fullWidth={isMobile}
                onPress={dispatchOccurrenceDrawerOpen}
                className="flex-1 max-md:h-8 max-md:gap-1 max-md:rounded-full md:flex-none"
              >
                <CalendarCheckIcon size={isMobile ? 12 : 16} />
                Log
                <CustomKbd
                  variant="default"
                  size={isMobile ? 'sm' : 'md'}
                  shortcutParams={['l', dispatchOccurrenceDrawerOpen]}
                >
                  L
                </CustomKbd>
              </CustomButton>
            </div>
          )}
          <div className="flex items-center gap-4">
            <CustomButton
              target="_blank"
              variant="bordered"
              rel="noopener noreferrer"
              className="hidden gap-2 xl:flex"
              href="https://habitrack.featurebase.app/roadmap"
            >
              <ArrowSquareOutIcon size={16} />
              <span>Roadmap</span>
              <CustomKbd
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
              </CustomKbd>
            </CustomButton>
            <AuthModalButton />
          </div>
        </div>
      </header>
    </nav>
  );
};

export default Header;
