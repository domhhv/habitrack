type StockCard = {
  badge: string;
  name: string;
  prefill: string;
  progress: number;
  remaining: string;
};

const STOCK_CARDS: StockCard[] = [
  {
    badge: 'auto-depletes 18 g per log',
    name: 'Coffee beans · Ethiopia 250 g',
    prefill: 'Prefills metrics: dose 18 g',
    progress: 45,
    remaining: '112 g remaining',
  },
  {
    badge: 'auto-depletes 1 per log',
    name: 'Energy gels · box of 12',
    prefill: 'Prefills metrics: carbs 22 g',
    progress: 42,
    remaining: '5 of 12 remaining',
  },
];

const StockCardMockup = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {STOCK_CARDS.map((stock) => {
        return (
          <div
            key={stock.name}
            className="rounded-xl border border-(--border) bg-(--surface) p-5"
          >
            <p className="text-sm font-extrabold">{stock.name}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-(--surface-tertiary)">
              <div
                style={{ width: `${stock.progress}%` }}
                className="h-full rounded-full bg-(--accent)"
              />
            </div>
            <p className="mt-2 text-xs font-bold text-(--muted)">
              {stock.remaining}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold">
              <span className="rounded-full bg-(--accent)/10 px-2.5 py-1 text-(--accent)">
                {stock.badge}
              </span>
              <span className="rounded-full bg-(--surface-secondary) px-2.5 py-1 text-(--muted)">
                {stock.prefill}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StockCardMockup;
