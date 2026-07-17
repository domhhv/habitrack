import { cn, Label, Dropdown } from '@heroui/react';
import { GearIcon, UserIcon, SignOutIcon } from '@phosphor-icons/react';

import { CustomButton } from '@components';
import { signOut } from '@services';
import { useUser, useProfile, useMobileSidebarActions } from '@stores';

import SidebarTooltip from './SidebarTooltip';

type UserMenuProps = {
  isExpanded?: boolean;
  isExpandedContentVisible?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

const UserMenu = ({
  isExpanded = false,
  isExpandedContentVisible = isExpanded,
  onOpenChange,
}: UserMenuProps) => {
  const user = useUser();
  const profile = useProfile();
  const { closeMobileSidebar } = useMobileSidebarActions();

  const email = profile?.email || user?.email || 'Anonymous account';

  return (
    <Dropdown onOpenChange={onOpenChange}>
      {isExpanded ? (
        <CustomButton
          variant="ghost"
          aria-label="Open account menu"
          className="h-auto w-full justify-start px-2.5 py-1.5"
        >
          <UserIcon size={20} className="mbs-0.5 mbe-0.5 shrink-0" />
          <div
            className={cn(
              'flex min-w-0 flex-col items-start transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none',
              isExpandedContentVisible
                ? 'translate-x-0 opacity-100'
                : '-translate-x-1 opacity-0'
            )}
          >
            {!!profile?.name && (
              <span className="max-w-full truncate text-sm leading-tight font-semibold">
                {profile.name}
              </span>
            )}
            <span className="text-muted max-w-full truncate text-xs leading-tight font-normal">
              {email}
            </span>
          </div>
        </CustomButton>
      ) : (
        <SidebarTooltip
          isEnabled
          className="pb-1.5"
          content={
            profile?.name ? (
              <div className="space-y-0.5">
                <p className="max-w-full truncate text-sm leading-tight font-semibold">
                  {profile.name}
                </p>
                <span className="text-muted max-w-full truncate text-xs leading-tight font-normal">
                  {email}
                </span>
              </div>
            ) : (
              email
            )
          }
        >
          <CustomButton
            size="sm"
            isIconOnly
            variant="ghost"
            aria-label="Open account menu"
          >
            <UserIcon size={18} />
          </CustomButton>
        </SidebarTooltip>
      )}
      <Dropdown.Popover className="min-w-[200px]">
        <Dropdown.Menu aria-label="Account">
          <Dropdown.Item
            id="settings"
            href="/settings"
            textValue="Settings"
            onAction={closeMobileSidebar}
          >
            <GearIcon className="size-4 shrink-0" />
            <Label>Settings</Label>
          </Dropdown.Item>
          <Dropdown.Item
            id="logout"
            variant="danger"
            textValue="Log Out"
            onAction={() => {
              signOut();
              closeMobileSidebar();
            }}
          >
            <SignOutIcon className="text-danger size-4 shrink-0" />
            <Label>Log Out</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};

export default UserMenu;
