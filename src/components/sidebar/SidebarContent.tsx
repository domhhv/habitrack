import { cn, Link, Tooltip } from '@heroui/react';
import { today, getLocalTimeZone } from '@internationalized/date';
import {
  NoteIcon,
  GearIcon,
  RepeatIcon,
  SignInIcon,
  UserPlusIcon,
  GithubLogoIcon,
  NotePencilIcon,
  RoadHorizonIcon,
  CalendarDotsIcon,
  CalendarCheckIcon,
  ArrowSquareOutIcon,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router';

import { CustomKbd, ThemeToggle, CustomButton } from '@components';
import {
  useUser,
  useNoteDrawerActions,
  useOccurrenceDrawerActions,
} from '@stores';

import SidebarModeSelect from './SidebarModeSelect';
import ThemeMenu from './ThemeMenu';
import UserMenu from './UserMenu';

const ROADMAP_URL = 'https://habitrack.featurebase.app/roadmap';
const GITHUB_URL = 'https://github.com/domhhv/habitrack';

const EXTERNAL_LINKS = [
  {
    href: ROADMAP_URL,
    icon: RoadHorizonIcon,
    id: 'roadmap',
    label: 'Roadmap',
  },
  {
    href: GITHUB_URL,
    icon: GithubLogoIcon,
    id: 'source-code',
    label: 'Source Code on GitHub',
  },
] as const;

type SidebarTooltipProps = {
  children: ReactNode;
  content: ReactNode;
  isEnabled: boolean;
};

const SidebarTooltip = ({
  children,
  content,
  isEnabled,
}: SidebarTooltipProps) => {
  if (!isEnabled) {
    return children;
  }

  return (
    <Tooltip closeDelay={0}>
      <Tooltip.Trigger>{children}</Tooltip.Trigger>
      <Tooltip.Content placement="right">{content}</Tooltip.Content>
    </Tooltip>
  );
};

type SidebarContentProps = {
  hasTooltips?: boolean;
  isExpanded: boolean;
  isOverlay?: boolean;
  onClose?: () => void;
};

const SidebarContent = ({
  hasTooltips = false,
  isExpanded,
  isOverlay = false,
  onClose,
}: SidebarContentProps) => {
  const user = useUser();
  const { pathname } = useLocation();
  const { openNoteDrawer } = useNoteDrawerActions();
  const { openOccurrenceDrawer } = useOccurrenceDrawerActions();

  const dispatchNoteDrawerOpen = () => {
    onClose?.();
    openNoteDrawer(today(getLocalTimeZone()), 'day');
  };

  const dispatchOccurrenceDrawerOpen = () => {
    onClose?.();
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
            href: '/settings',
            icon: GearIcon,
            id: 'settings',
            isActive: pathname === '/settings',
            label: 'Settings',
          },
        ] as const)
      : []),
  ] as const;

  const getNavLinkClassName = (isActive: boolean) => {
    return cn(
      'text-foreground hover:bg-background-secondary flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium',
      !isExpanded && 'justify-center px-0',
      isActive && 'bg-accent-soft text-accent hover:bg-accent-soft-hover'
    );
  };

  const getActionClassName = () => {
    return cn(
      'text-foreground hover:bg-background-secondary h-9 w-full justify-start gap-2.5 rounded-lg px-2.5 text-sm font-medium has-[kbd]:gap-2.5 has-[kbd]:pr-2.5',
      !isExpanded && 'justify-center px-0'
    );
  };

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col gap-4 overflow-x-hidden overflow-y-auto p-3',
        !isExpanded && 'items-center px-2',
        isOverlay && 'pt-12'
      )}
    >
      {!!user && !isOverlay && (
        <div className="border-border flex w-full flex-col gap-1 border-b pb-3">
          <SidebarTooltip content="Log (L)" isEnabled={hasTooltips}>
            <CustomButton
              variant="ghost"
              aria-label="Log an occurrence"
              className={getActionClassName()}
              onPress={dispatchOccurrenceDrawerOpen}
            >
              <span className="bg-accent text-accent-foreground flex size-6 shrink-0 items-center justify-center rounded-full">
                <CalendarCheckIcon size={14} />
              </span>
              {isExpanded && (
                <>
                  <span className="truncate">Log</span>
                  <CustomKbd size="sm" variant="default" className="ms-auto">
                    L
                  </CustomKbd>
                </>
              )}
            </CustomButton>
          </SidebarTooltip>
          <SidebarTooltip content="Note (N)" isEnabled={hasTooltips}>
            <CustomButton
              variant="ghost"
              aria-label="Write a note"
              className={getActionClassName()}
              onPress={dispatchNoteDrawerOpen}
            >
              <span className="bg-accent-soft text-accent flex size-6 shrink-0 items-center justify-center rounded-full">
                <NotePencilIcon size={14} />
              </span>
              {isExpanded && (
                <>
                  <span className="truncate">Note</span>
                  <CustomKbd size="sm" variant="default" className="ms-auto">
                    N
                  </CustomKbd>
                </>
              )}
            </CustomButton>
          </SidebarTooltip>
        </div>
      )}
      <nav aria-label="Main navigation" className="flex w-full flex-col gap-1">
        {navItems.map(({ href, icon: ItemIcon, id, isActive, label }) => {
          return (
            <SidebarTooltip key={id} content={label} isEnabled={hasTooltips}>
              <Link
                href={href}
                onPress={onClose}
                className={getNavLinkClassName(isActive)}
                aria-current={isActive ? 'page' : undefined}
              >
                <ItemIcon size={18} className="shrink-0" />
                {isExpanded && <span className="truncate">{label}</span>}
              </Link>
            </SidebarTooltip>
          );
        })}
      </nav>
      <div className="border-border flex w-full flex-col gap-1 border-t pt-3">
        {EXTERNAL_LINKS.map(({ href, icon: ItemIcon, id, label }) => {
          return (
            <SidebarTooltip key={id} content={label} isEnabled={hasTooltips}>
              <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(getNavLinkClassName(false), 'text-muted')}
              >
                <ItemIcon size={18} className="shrink-0" />
                {isExpanded && (
                  <>
                    <span className="truncate">{label}</span>
                    <ArrowSquareOutIcon className="text-muted/50 ms-auto size-4 shrink-0" />
                  </>
                )}
              </Link>
            </SidebarTooltip>
          );
        })}
      </div>
      <div
        className={cn(
          'border-border mt-auto flex w-full flex-col gap-2 border-t pt-3',
          !isExpanded && 'items-center'
        )}
      >
        {!isOverlay && (
          <div
            className={cn(
              'flex items-center',
              isExpanded ? 'justify-between' : 'flex-col justify-center gap-1'
            )}
          >
            {isExpanded ? <ThemeToggle /> : <ThemeMenu />}
            <SidebarModeSelect />
          </div>
        )}
        {user ? (
          <UserMenu isExpanded={isExpanded} />
        ) : isExpanded ? (
          <div className="flex w-full gap-2 lg:flex-col">
            <CustomButton
              size="sm"
              href="/login"
              onPress={onClose}
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
              onPress={onClose}
              data-testid="register-button"
            >
              Join
              <CustomKbd size="sm" variant="default">
                J
              </CustomKbd>
            </CustomButton>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <SidebarTooltip content="Log In (I)" isEnabled={hasTooltips}>
              <CustomButton
                size="sm"
                isIconOnly
                href="/login"
                variant="bordered"
                aria-label="Log In"
              >
                <SignInIcon size={16} />
              </CustomButton>
            </SidebarTooltip>
            <SidebarTooltip content="Join (J)" isEnabled={hasTooltips}>
              <CustomButton
                size="sm"
                isIconOnly
                href="/register"
                variant="primary"
                aria-label="Join"
              >
                <UserPlusIcon size={16} />
              </CustomButton>
            </SidebarTooltip>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarContent;
