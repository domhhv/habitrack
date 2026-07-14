import type { TooltipProps, TooltipContentProps } from '@heroui/react';
import { cn, Link, Tooltip } from '@heroui/react';
import { today, getLocalTimeZone } from '@internationalized/date';
import {
  NoteIcon,
  RepeatIcon,
  SignInIcon,
  UserPlusIcon,
  GithubLogoIcon,
  NotePencilIcon,
  RoadHorizonIcon,
  CalendarDotsIcon,
  ArrowUpRightIcon,
  CalendarCheckIcon,
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
  className?: string;
  content: ReactNode;
  isEnabled: boolean;
  offset?: TooltipContentProps['offset'];
  placement?: TooltipContentProps['placement'];
} & TooltipProps;

const SidebarTooltip = ({
  children,
  className,
  content,
  isEnabled,
  offset = 8,
  placement = 'right',
  ...props
}: SidebarTooltipProps) => {
  if (!isEnabled) {
    return children;
  }

  return (
    <Tooltip closeDelay={0} {...props} delay={0}>
      <Tooltip.Trigger className={className}>{children}</Tooltip.Trigger>
      <Tooltip.Content offset={offset} placement={placement}>
        {content}
      </Tooltip.Content>
    </Tooltip>
  );
};

type SidebarContentProps = {
  hasTooltips?: boolean;
  isExpanded: boolean;
  isOverlay?: boolean;
  onClose?: () => void;
  onDropdownOpenChange?: (
    dropdown: 'sidebar' | 'user',
    isOpen: boolean
  ) => void;
};

const SidebarContent = ({
  hasTooltips = false,
  isExpanded,
  isOverlay = false,
  onClose,
  onDropdownOpenChange,
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
        ] as const)
      : []),
  ] as const;

  const actionItems = [
    {
      icon: CalendarCheckIcon,
      id: 'occurrence',
      keyboardShortcut: 'L',
      label: 'Log',
      onPress: dispatchOccurrenceDrawerOpen,
      variant: 'primary',
    },
    {
      icon: NotePencilIcon,
      id: 'note',
      keyboardShortcut: 'N',
      label: 'Note',
      onPress: dispatchNoteDrawerOpen,
      variant: 'secondary',
    },
  ];

  const getLinkClassName = (isActive: boolean, isInternal: boolean) => {
    return cn(
      'text-foreground flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium',
      !isExpanded && 'justify-center px-0',
      isActive && 'bg-accent-soft text-accent hover:bg-accent-soft-hover',
      isInternal && 'hover:bg-background-secondary no-underline'
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
      <div className="flex items-center justify-between gap-2">
        {isExpanded && <h1>Habitrack</h1>}
        <SidebarModeSelect
          onOpenChange={(isOpen) => {
            onDropdownOpenChange?.('sidebar', isOpen);
          }}
        />
      </div>
      {!!user && !isOverlay && (
        <div className="border-border flex w-full flex-col gap-1 border-b pb-3">
          {actionItems.map(
            ({
              icon: ItemIcon,
              id,
              keyboardShortcut,
              label,
              onPress,
              variant,
            }) => {
              return (
                <SidebarTooltip
                  key={id}
                  isEnabled={hasTooltips}
                  content={`${label} (${keyboardShortcut})`}
                >
                  <CustomButton
                    variant="ghost"
                    onPress={onPress}
                    aria-label={label}
                    className={getActionClassName()}
                  >
                    {isExpanded ? (
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              'flex size-7 shrink-0 items-center justify-center rounded-full',
                              variant === 'primary'
                                ? 'bg-accent text-accent-foreground'
                                : 'bg-surface-tertiary text-accent border-border border'
                            )}
                          >
                            <ItemIcon size={14} />
                          </span>
                          <span className="truncate">{label}</span>
                        </div>
                        <CustomKbd
                          size="md"
                          variant="default"
                          className="border-border box-content! w-3 border"
                        >
                          {keyboardShortcut}
                        </CustomKbd>
                      </div>
                    ) : (
                      <span
                        className={cn(
                          'flex size-7 shrink-0 items-center justify-center rounded-full',
                          variant === 'primary'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-default text-accent border-border border'
                        )}
                      >
                        <ItemIcon size={14} />
                      </span>
                    )}
                  </CustomButton>
                </SidebarTooltip>
              );
            }
          )}
        </div>
      )}
      <nav aria-label="Main navigation" className="flex w-full flex-col gap-1">
        {navItems.map(({ href, icon: ItemIcon, id, isActive, label }) => {
          return (
            <SidebarTooltip key={id} content={label} isEnabled={hasTooltips}>
              <Link
                href={href}
                onPress={onClose}
                className={getLinkClassName(isActive, true)}
                aria-current={isActive ? 'page' : undefined}
              >
                <ItemIcon size={18} className="shrink-0" />
                {isExpanded && <span className="truncate">{label}</span>}
              </Link>
            </SidebarTooltip>
          );
        })}
      </nav>
      <div
        className={cn(
          'border-border mt-auto flex w-full flex-col gap-2 border-t pt-3',
          !isExpanded && 'items-center'
        )}
      >
        <div
          className={cn(
            'flex w-full items-center justify-between gap-2',
            !isExpanded && 'flex-col'
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
            </div>
          )}
          <div className={cn('flex gap-2', !isExpanded && 'hidden')}>
            {EXTERNAL_LINKS.map(({ href, icon: ItemIcon, id, label }) => {
              return (
                <SidebarTooltip
                  key={id}
                  isEnabled
                  className="h-5"
                  placement={isExpanded ? 'top' : 'right'}
                  content={
                    <div className="flex items-center gap-2">
                      {label}
                      <ArrowUpRightIcon />
                    </div>
                  }
                >
                  <CustomButton
                    size="sm"
                    href={href}
                    variant="ghost"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted h-6 w-7 rounded-md"
                  >
                    <ItemIcon size={20} className="shrink-0" />
                  </CustomButton>
                </SidebarTooltip>
              );
            })}
          </div>
        </div>
        {user ? (
          <UserMenu
            isExpanded={isExpanded}
            onOpenChange={(isOpen) => {
              onDropdownOpenChange?.('user', isOpen);
            }}
          />
        ) : isExpanded ? (
          <div className="flex w-full gap-2">
            <CustomButton
              size="sm"
              href="/login"
              onPress={onClose}
              variant="bordered"
              className="flex-1"
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
              className="flex-1"
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
