import { today, getLocalTimeZone } from '@internationalized/date';
import {
  ListIcon,
  NotePencilIcon,
  CalendarCheckIcon,
} from '@phosphor-icons/react';

import { UserMenu, CustomKbd, CustomButton } from '@components';
import { useScreenWidth } from '@hooks';
import {
  useUser,
  useNoteDrawerActions,
  useMobileSidebarActions,
  useOccurrenceDrawerActions,
} from '@stores';

import ThemeToggle from './ThemeToggle';

const Header = () => {
  const user = useUser();
  const { isMobile } = useScreenWidth();
  const { openMobileSidebar } = useMobileSidebarActions();
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
    <nav className="bg-background border-border sticky top-0 z-50 h-16 w-full border-b lg:hidden">
      <header className="flex h-full w-full items-center justify-between px-4 md:px-8">
        <CustomButton
          size="sm"
          isIconOnly
          variant="outline"
          onPress={openMobileSidebar}
          aria-label="Open navigation menu"
        >
          <ListIcon size={isMobile ? 16 : 18} />
        </CustomButton>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <UserMenu />
          ) : (
            <>
              <CustomButton
                size="sm"
                href="/login"
                variant="bordered"
                data-testid="login-button"
              >
                Log In
                <CustomKbd size="sm" variant="default">
                  I
                </CustomKbd>
              </CustomButton>
              <CustomButton
                size="sm"
                href="/register"
                variant="primary"
                data-testid="register-button"
              >
                Join
                <CustomKbd size="sm" variant="default">
                  J
                </CustomKbd>
              </CustomButton>
            </>
          )}
        </div>
      </header>
      {!!user && (
        <div className="bg-background-secondary border-border dark:border-border fixed right-0 bottom-0 left-0 z-50 flex w-full gap-2 border-t p-2 px-4 md:right-4 md:bottom-4 md:left-auto md:w-auto md:border-0 md:bg-transparent md:p-0 dark:md:bg-transparent">
          <CustomButton
            size="sm"
            variant="bordered"
            fullWidth={isMobile}
            onPress={dispatchNoteDrawerOpen}
            className="flex-1 max-md:h-8 max-md:gap-1 max-md:rounded-full md:flex-none"
          >
            <NotePencilIcon size={isMobile ? 12 : 16} />
            Note
            <CustomKbd isSolid size="sm" variant="light">
              N
            </CustomKbd>
          </CustomButton>
          <CustomButton
            size="sm"
            variant="primary"
            fullWidth={isMobile}
            onPress={dispatchOccurrenceDrawerOpen}
            className="flex-1 max-md:h-8 max-md:gap-1 max-md:rounded-full md:flex-none"
          >
            <CalendarCheckIcon size={isMobile ? 12 : 16} />
            Log
            <CustomKbd size="sm" variant="default">
              L
            </CustomKbd>
          </CustomButton>
        </div>
      )}
    </nav>
  );
};

export default Header;
