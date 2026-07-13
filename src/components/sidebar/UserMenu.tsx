import { Label, Dropdown } from '@heroui/react';
import { GearIcon, UserIcon, SignOutIcon } from '@phosphor-icons/react';

import { CustomButton } from '@components';
import { signOut } from '@services';
import { useUser, useProfile, useMobileSidebarActions } from '@stores';

type UserMenuProps = {
  isExpanded?: boolean;
};

const UserMenu = ({ isExpanded = false }: UserMenuProps) => {
  const user = useUser();
  const profile = useProfile();
  const { closeMobileSidebar } = useMobileSidebarActions();

  const email = profile?.email || user?.email || 'Anonymous account';

  return (
    <Dropdown>
      {isExpanded ? (
        <CustomButton
          variant="ghost"
          aria-label="Open account menu"
          className="h-auto w-full justify-start px-2 py-1.5"
        >
          <UserIcon size={20} className="shrink-0" />
          <div className="flex min-w-0 flex-col items-start">
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
        <CustomButton
          size="sm"
          isIconOnly
          variant="ghost"
          aria-label="Open account menu"
        >
          <UserIcon size={18} />
        </CustomButton>
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
