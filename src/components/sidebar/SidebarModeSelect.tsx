import { Label, Dropdown } from '@heroui/react';
import type { Icon } from '@phosphor-icons/react';
import {
  CheckIcon,
  CursorIcon,
  SidebarIcon,
  ArrowsInLineHorizontalIcon,
  ArrowsOutLineHorizontalIcon,
} from '@phosphor-icons/react';

import { CustomButton } from '@components';
import { useSidebarMode, type SidebarMode } from '@hooks';

const MODE_OPTIONS: { icon: Icon; id: SidebarMode; label: string }[] = [
  { icon: ArrowsOutLineHorizontalIcon, id: 'expanded', label: 'Expanded' },
  { icon: ArrowsInLineHorizontalIcon, id: 'collapsed', label: 'Collapsed' },
  { icon: CursorIcon, id: 'hover', label: 'Expand on hover' },
];

type SidebarModeSelectProps = {
  onOpenChange?: (isOpen: boolean) => void;
};

const SidebarModeSelect = ({ onOpenChange }: SidebarModeSelectProps) => {
  const { setSidebarMode, sidebarMode } = useSidebarMode();

  return (
    <Dropdown onOpenChange={onOpenChange}>
      <CustomButton
        size="sm"
        isIconOnly
        variant="ghost"
        aria-label="Sidebar display options"
      >
        <SidebarIcon size={16} />
      </CustomButton>
      <Dropdown.Popover className="min-w-[210px]">
        <Dropdown.Menu aria-label="Sidebar display">
          {MODE_OPTIONS.map(({ icon: ModeIcon, id, label }) => {
            return (
              <Dropdown.Item
                id={id}
                key={id}
                textValue={label}
                className="justify-between"
                onAction={() => {
                  setSidebarMode(id);
                }}
              >
                <div className="flex items-center gap-2">
                  <ModeIcon className="size-4 shrink-0" />
                  <Label>{label}</Label>
                </div>
                {sidebarMode === id && (
                  <CheckIcon className="text-accent size-4 shrink-0" />
                )}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};

export default SidebarModeSelect;
