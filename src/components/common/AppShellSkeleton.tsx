import React from 'react';

const SIDEBAR_ITEMS = Array.from({ length: 5 }, (_, index) => {
  return index;
});

const WEEK_DAYS = Array.from({ length: 7 }, (_, index) => {
  return index;
});

const MONTH_CELLS = Array.from({ length: 35 }, (_, index) => {
  return index;
});

/**
 * A static outline of the app shell and a month grid. It shows while the app loads, both during
 * the first render of a document and while navigating into the app, so it must not depend on
 * dates, the viewport or any browser API.
 */
const AppShellSkeleton = () => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading Habitrack"
      className="bg-background flex min-h-dvh w-full flex-col lg:flex-row"
    >
      <div className="border-border flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-8 lg:hidden">
        <div className="bg-surface-secondary h-6 w-28 rounded-md" />
        <div className="bg-surface-secondary size-9 rounded-full" />
      </div>
      <aside className="border-border hidden h-dvh w-16 shrink-0 flex-col items-center gap-4 border-r py-5 lg:flex">
        {SIDEBAR_ITEMS.map((item) => {
          return (
            <div
              key={item}
              className="bg-surface-secondary size-8 rounded-lg"
            />
          );
        })}
      </aside>
      <main className="flex min-w-0 flex-1 animate-pulse flex-col gap-3 px-8 pt-4 pb-8 motion-reduce:animate-none lg:pr-8 lg:pl-16">
        <div className="flex items-center justify-between py-4">
          <div className="bg-surface-secondary h-8 w-48 rounded-lg" />
          <div className="flex gap-2">
            <div className="bg-surface-secondary h-9 w-20 rounded-lg" />
            <div className="bg-surface-secondary size-9 rounded-lg" />
            <div className="bg-surface-secondary size-9 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEK_DAYS.map((day) => {
            return (
              <div
                key={day}
                className="bg-surface-secondary mx-auto h-4 w-8 rounded"
              />
            );
          })}
        </div>
        <div className="grid flex-1 grid-cols-7 grid-rows-5 gap-1.5">
          {MONTH_CELLS.map((cell) => {
            return (
              <div
                key={cell}
                className="border-border bg-surface min-h-16 rounded-md border"
              />
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default AppShellSkeleton;
