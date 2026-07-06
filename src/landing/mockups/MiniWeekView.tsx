import { dotsForDay, WEEKDAY_LABELS, TRAIT_DOT_CLASSES } from './demo-data';

const WEEK_START_DAY = 6;

const MiniWeekView = () => {
  return (
    <div className="rounded-xl border border-(--border) bg-(--surface) p-4">
      <p className="text-sm font-extrabold">Week 28 · Jul 6 – 12</p>
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((label, index) => {
          const day = WEEK_START_DAY + index;
          const dots = dotsForDay(day);

          return (
            <div
              key={label}
              className={`flex flex-col gap-1 rounded-md bg-(--surface-secondary)/70 p-1.5 ${
                day === 7 ? 'ring-2 ring-(--accent)' : ''
              }`}
            >
              <span className="text-center text-[9px] font-bold text-(--muted)">
                {label} {day}
              </span>
              <div className="flex min-h-16 flex-col gap-1">
                {dots.map((color) => {
                  return (
                    <span
                      key={color}
                      className={`h-2 w-full rounded-full ${TRAIT_DOT_CLASSES[color]}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniWeekView;
