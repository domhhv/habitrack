import type { TraitDotColor } from './demo-data';
import { TRAIT_DOT_CLASSES } from './demo-data';

type DayEntry = {
  color: TraitDotColor;
  detail: string;
  label: string;
  time: string;
};

const DAY_ENTRIES: DayEntry[] = [
  {
    color: 'green',
    detail: '5.2 km · 41 min',
    label: 'Running',
    time: '07:30',
  },
  {
    color: 'amber',
    detail: '18 g · lighter roast',
    label: 'Coffee',
    time: '08:12',
  },
  { color: 'amber', detail: '18 g', label: 'Coffee', time: '13:05' },
  {
    color: 'rose',
    detail: 'crackers, again',
    label: 'Late snack',
    time: '23:40',
  },
];

const MiniDayView = () => {
  return (
    <div className="rounded-xl border border-(--border) bg-(--surface) p-4">
      <p className="text-sm font-extrabold">Tuesday, Jul 7</p>
      <ul className="mt-3 flex flex-col gap-2">
        {DAY_ENTRIES.map((entry) => {
          return (
            <li
              key={entry.time}
              className="flex items-center gap-3 rounded-md bg-(--surface-secondary)/70 px-3 py-2"
            >
              <span className="text-[10px] font-bold text-(--muted) tabular-nums">
                {entry.time}
              </span>
              <span
                className={`size-2 rounded-full ${TRAIT_DOT_CLASSES[entry.color]}`}
              />
              <span className="text-xs font-bold">{entry.label}</span>
              <span className="ml-auto text-[10px] font-semibold text-(--muted)">
                {entry.detail}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MiniDayView;
