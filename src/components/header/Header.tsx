import { Label, Dropdown, Separator } from '@heroui/react';
import { today, getLocalTimeZone } from '@internationalized/date';
import {
  ListIcon,
  NoteIcon,
  UserIcon,
  RepeatIcon,
  MapPinIcon,
  SignOutIcon,
  GithubLogoIcon,
  NotePencilIcon,
  RoadHorizonIcon,
  CalendarDotsIcon,
  CalendarCheckIcon,
  ArrowSquareOutIcon,
} from '@phosphor-icons/react';
import { useLocation } from 'react-router';

import { CustomKbd, CustomButton, AuthModalButton } from '@components';
import { useScreenWidth } from '@hooks';
import { signOut } from '@services';
import {
  useUser,
  useNoteDrawerActions,
  useOccurrenceDrawerActions,
} from '@stores';

import ThemeToggle from './ThemeToggle';

const ROADMAP_URL = 'https://habitrack.featurebase.app/roadmap';
const GITHUB_URL = 'https://github.com/domhhv/habitrack';

const Header = () => {
  const user = useUser();
  const { isMobile } = useScreenWidth();
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

  const navItems = [
    {
      href: '/calendar/month',
      icon: CalendarDotsIcon,
      id: 'calendar',
      isActive: pathname.startsWith('/calendar'),
      label: 'Calendar',
    },
    ...(user
      ? ([
          {
            href: '/habits',
            icon: RepeatIcon,
            id: 'habits',
            isActive: pathname.startsWith('/habits'),
            label: 'Habits',
          },
          {
            href: '/notes',
            icon: NoteIcon,
            id: 'notes',
            isActive: pathname === '/notes',
            label: 'Notes',
          },
          {
            href: '/account',
            icon: UserIcon,
            id: 'account',
            isActive: pathname === '/account',
            label: 'Account',
          },
        ] as const)
      : []),
  ] as const;

  const activeLabel =
    navItems.find((item) => {
      return item.isActive;
    })?.label ?? 'Menu';

  return (
    <nav className="bg-background border-border sticky top-0 z-50 h-16 w-full border-b">
      <header className="flex h-full w-full items-center justify-between px-8 lg:px-8">
        <div className="flex items-center gap-2">
          <Dropdown>
            <CustomButton
              size="sm"
              variant="outline"
              aria-label="Open navigation menu"
            >
              <ListIcon size={isMobile ? 16 : 18} />
              <span>{activeLabel}</span>
            </CustomButton>
            <Dropdown.Popover className="min-w-[250px]">
              <Dropdown.Menu aria-label="Navigation">
                <Dropdown.Section>
                  {navItems.map(({ href, icon: Icon, id, isActive, label }) => {
                    return (
                      <Dropdown.Item
                        id={id}
                        key={id}
                        href={href}
                        textValue={label}
                        className="justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="size-4 shrink-0" />
                          <Label>{label}</Label>
                        </div>
                        {isActive && user && (
                          <div className="text-muted flex items-center gap-1 text-xs">
                            <MapPinIcon />
                            <span className="ms-auto">You&apos;re here</span>
                          </div>
                        )}
                      </Dropdown.Item>
                    );
                  })}
                </Dropdown.Section>
                <Separator className="bg-muted/25" />
                <Dropdown.Section>
                  <Dropdown.Item
                    id="roadmap"
                    target="_blank"
                    href={ROADMAP_URL}
                    textValue="Roadmap"
                    rel="noopener noreferrer"
                    className="justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <RoadHorizonIcon className="size-4 shrink-0" />
                      <Label>Roadmap</Label>
                    </div>
                    <ArrowSquareOutIcon className="text-muted/50 size-4 shrink-0" />
                  </Dropdown.Item>
                  <Dropdown.Item
                    target="_blank"
                    id="source-code"
                    href={GITHUB_URL}
                    rel="noopener noreferrer"
                    className="justify-between"
                    textValue="Source Code on GitHub"
                  >
                    <div className="flex items-center gap-2">
                      <GithubLogoIcon className="size-4 shrink-0" />
                      <Label>Source Code on GitHub</Label>
                    </div>
                    <ArrowSquareOutIcon className="text-muted/50 size-4 shrink-0 justify-self-end" />
                  </Dropdown.Item>
                </Dropdown.Section>
                {!!user && (
                  <>
                    <Separator className="bg-muted/25" />
                    <Dropdown.Section>
                      <Dropdown.Item
                        id="logout"
                        variant="danger"
                        onAction={signOut}
                        textValue="Log Out"
                      >
                        <SignOutIcon className="text-danger size-4 shrink-0" />
                        <Label>Log Out</Label>
                      </Dropdown.Item>
                    </Dropdown.Section>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!!user && (
            <div className="bg-background-secondary border-border dark:border-border fixed right-0 bottom-0 left-0 z-50 flex w-full gap-2 border-t p-2 px-4 md:right-4 md:bottom-4 md:left-auto md:w-auto md:border-0 md:bg-transparent md:p-0 xl:static xl:right-auto xl:bottom-auto xl:border-0 xl:bg-transparent xl:p-0 dark:md:bg-transparent dark:xl:bg-transparent">
              <CustomButton
                size="sm"
                variant="bordered"
                fullWidth={isMobile}
                onPress={dispatchNoteDrawerOpen}
                className="flex-1 max-md:h-8 max-md:gap-1 max-md:rounded-full md:flex-none"
              >
                <NotePencilIcon size={isMobile ? 12 : 16} />
                Note
                <CustomKbd
                  isSolid
                  size="sm"
                  variant="light"
                  shortcutParams={['n', dispatchNoteDrawerOpen]}
                >
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
                <CustomKbd
                  size="sm"
                  variant="default"
                  shortcutParams={['l', dispatchOccurrenceDrawerOpen]}
                >
                  L
                </CustomKbd>
              </CustomButton>
            </div>
          )}
          {!user && <AuthModalButton />}
        </div>
      </header>
    </nav>
  );
};

export default Header;
