import type { CSSProperties } from 'react';

import { dotsForDay, WEEKDAY_LABELS, TRAIT_DOT_CLASSES } from './demo-data';

const LEADING_BLANKS = 2;
const DAYS_IN_MONTH = 31;
const TOTAL_CELLS = 35;
const TODAY = 7;

const MiniMonthCalendar = () => {
  return (
    <div className="rounded-xl border border-(--border) bg-(--surface) p-4 shadow-xl">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold">July 2026</p>
        <div className="flex gap-1 rounded-lg bg-(--surface-secondary) p-1 text-[10px] font-bold text-(--muted)">
          <span className="rounded-md bg-(--surface) px-2 py-0.5 text-(--foreground) shadow-sm">
            Month
          </span>
          <span className="px-2 py-0.5">Week</span>
          <span className="px-2 py-0.5">Day</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-(--muted)">
        {WEEKDAY_LABELS.map((label) => {
          return <span key={label}>{label}</span>;
        })}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: TOTAL_CELLS }, (_, index) => {
          const day = index - LEADING_BLANKS + 1;
          const isDay = day >= 1 && day <= DAYS_IN_MONTH;
          const dots = isDay ? dotsForDay(day) : [];

          return (
            <div
              key={index}
              className={`flex h-9 flex-col items-center justify-between rounded-md p-1 sm:h-11 ${
                isDay ? 'bg-(--surface-secondary)/70' : ''
              } ${day === TODAY ? 'ring-2 ring-(--accent)' : ''}`}
            >
              {isDay && (
                <>
                  <span className="text-[9px] font-bold text-(--muted) sm:text-[10px]">
                    {day}
                  </span>
                  <span className="flex gap-0.5 pb-0.5">
                    {dots.map((color, dotIndex) => {
                      return (
                        <span
                          key={color}
                          className={`landing-dot size-1.5 rounded-full ${TRAIT_DOT_CLASSES[color]}`}
                          style={
                            {
                              '--pop-delay': `${index * 20 + dotIndex * 70}ms`,
                            } as CSSProperties
                          }
                        />
                      );
                    })}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-(--muted)">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-(--warning)" />
          Coffee
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-(--accent)" />
          Running
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-(--danger)" />
          Late snacks
        </span>
      </div>
    </div>
  );
};

export default MiniMonthCalendar;
