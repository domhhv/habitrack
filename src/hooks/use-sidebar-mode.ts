import React from 'react';

export type SidebarMode = 'collapsed' | 'expanded' | 'hover';

const STORAGE_KEY = 'sidebar-mode';

const listeners = new Set<() => void>();

const isSidebarMode = (value: string | null): value is SidebarMode => {
  return value === 'collapsed' || value === 'expanded' || value === 'hover';
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener('storage', listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
};

const getSnapshot = (): SidebarMode => {
  const storedMode = localStorage.getItem(STORAGE_KEY);

  return isSidebarMode(storedMode) ? storedMode : 'expanded';
};

const setSidebarMode = (mode: SidebarMode) => {
  localStorage.setItem(STORAGE_KEY, mode);
  listeners.forEach((listener) => {
    return listener();
  });
};

const useSidebarMode = () => {
  const sidebarMode = React.useSyncExternalStore(subscribe, getSnapshot);

  return { setSidebarMode, sidebarMode };
};

export default useSidebarMode;
