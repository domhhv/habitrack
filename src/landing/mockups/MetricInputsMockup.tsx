const SCALE_MAX = 5;
const SCALE_VALUE = 4;

const ROUTE_OPTIONS = ['Park loop', 'Track', 'Streets'];

const MetricInputsMockup = () => {
  return (
    <div className="rounded-xl border border-(--border) bg-(--surface) p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold">Log Running</p>
        <span className="text-[10px] font-bold text-(--muted)">
          Tue, Jul 7 · 07:30
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-3 text-xs font-semibold">
        <div className="flex items-center justify-between gap-4">
          <span className="text-(--muted)">Distance</span>
          <span className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md border border-(--border) text-(--muted)">
              −
            </span>
            <span className="w-16 rounded-md bg-(--surface-secondary) px-2 py-1 text-center font-bold tabular-nums">
              5.2 km
            </span>
            <span className="flex size-6 items-center justify-center rounded-md border border-(--border) text-(--muted)">
              +
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-(--muted)">Duration</span>
          <span className="rounded-md bg-(--surface-secondary) px-2 py-1 font-bold tabular-nums">
            00:41:32
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-(--muted)">Effort</span>
          <span className="flex items-center gap-1">
            {Array.from({ length: SCALE_MAX }, (_, index) => {
              return (
                <span
                  key={index}
                  className={`size-3 rounded-full ${
                    index < SCALE_VALUE
                      ? 'bg-(--accent)'
                      : 'bg-(--surface-tertiary)'
                  }`}
                />
              );
            })}
            <span className="ml-1 text-(--muted)">4/5</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-(--muted)">Route</span>
          <span className="flex gap-1">
            {ROUTE_OPTIONS.map((option, index) => {
              return (
                <span
                  key={option}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    index === 0
                      ? 'bg-(--accent) text-(--accent-foreground)'
                      : 'bg-(--surface-secondary) text-(--muted)'
                  }`}
                >
                  {option}
                </span>
              );
            })}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-(--muted)">Negative splits</span>
          <span className="flex h-5 w-9 items-center rounded-full bg-(--accent) p-0.5">
            <span className="ml-auto size-4 rounded-full bg-(--surface)" />
          </span>
        </div>
      </div>
      <div className="mt-5 rounded-(--field-radius) bg-(--accent) py-2 text-center text-xs font-bold text-(--accent-foreground)">
        Log occurrence
      </div>
    </div>
  );
};

export default MetricInputsMockup;
