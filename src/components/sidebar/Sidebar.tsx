import { cn, Drawer } from '@heroui/react';
import { today, getLocalTimeZone } from '@internationalized/date';
import React from 'react';
import { useNavigate } from 'react-router';

import { useSidebarMode, useKeyboardShortcut } from '@hooks';
import {
  useUser,
  useNoteDrawerActions,
  useMobileSidebarState,
  useMobileSidebarActions,
  useOccurrenceDrawerActions,
} from '@stores';

import SidebarContent from './SidebarContent';

const Sidebar = () => {
  const user = useUser();
  const navigate = useNavigate();
  const { sidebarMode } = useSidebarMode();
  const [isHovered, setIsHovered] = React.useState(false);
  const isMobileSidebarOpen = useMobileSidebarState();
  const { closeMobileSidebar } = useMobileSidebarActions();
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

  useKeyboardShortcut('l', dispatchOccurrenceDrawerOpen, { enabled: !!user });
  useKeyboardShortcut('n', dispatchNoteDrawerOpen, { enabled: !!user });
  useKeyboardShortcut(
    'i',
    () => {
      navigate('/login');
    },
    { enabled: !user }
  );
  useKeyboardShortcut(
    'j',
    () => {
      navigate('/register');
    },
    { enabled: !user }
  );

  const isExpanded =
    sidebarMode === 'expanded' || (sidebarMode === 'hover' && isHovered);

  return (
    <>
      <div
        className={cn(
          'shrink-0 transition-[width] duration-300 max-lg:hidden',
          sidebarMode === 'expanded' ? 'w-64' : 'w-16'
        )}
      >
        <aside
          onMouseLeave={() => {
            setIsHovered(false);
          }}
          onMouseEnter={() => {
            if (sidebarMode === 'hover') {
              setIsHovered(true);
            }
          }}
          className={cn(
            'bg-background border-border sticky top-0 z-40 flex h-dvh flex-col border-r transition-[width] duration-300',
            isExpanded ? 'w-64' : 'w-16',
            sidebarMode === 'hover' && isExpanded && 'shadow-xl'
          )}
        >
          <SidebarContent
            isExpanded={isExpanded}
            hasTooltips={sidebarMode === 'collapsed'}
          />
        </aside>
      </div>
      <Drawer
        isOpen={isMobileSidebarOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeMobileSidebar();
          }
        }}
      >
        <Drawer.Backdrop className="lg:hidden">
          <Drawer.Content placement="left" className="w-72 max-w-[85vw] p-0">
            <Drawer.Dialog className="h-full p-0">
              <Drawer.CloseTrigger />
              <SidebarContent
                isOverlay
                isExpanded
                onClose={closeMobileSidebar}
              />
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
};

export default Sidebar;
