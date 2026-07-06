import type { TraitDotColor } from './demo-data';
import { TRAIT_DOT_CLASSES } from './demo-data';

type ExpenseRow = {
  amount: string;
  color: TraitDotColor;
  detail: string;
  habit: string;
};

const EXPENSE_ROWS: ExpenseRow[] = [
  {
    amount: '€23.40',
    color: 'amber',
    detail: '26 logs · coffee beans',
    habit: 'Coffee',
  },
  {
    amount: '€8.50',
    color: 'green',
    detail: '7 logs · energy gels',
    habit: 'Running',
  },
  {
    amount: '$12.00',
    color: 'rose',
    detail: '5 logs · imported crackers',
    habit: 'Late snacks',
  },
];

const ExpenseSummaryMockup = () => {
  return (
    <div className="max-w-md rounded-xl border border-(--border) bg-(--surface) p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold">July so far</p>
        <span className="text-[10px] font-bold text-(--muted)">per habit</span>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {EXPENSE_ROWS.map((row) => {
          return (
            <li key={row.habit} className="flex items-center gap-3">
              <span
                className={`size-2 rounded-full ${TRAIT_DOT_CLASSES[row.color]}`}
              />
              <span className="text-xs font-bold">{row.habit}</span>
              <span className="text-[10px] font-semibold text-(--muted)">
                {row.detail}
              </span>
              <span className="ml-auto text-xs font-extrabold tabular-nums">
                {row.amount}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-(--border) pt-3 text-xs font-extrabold">
        <span className="text-(--muted)">Month total</span>
        <span className="tabular-nums">€31.90 + $12.00</span>
      </div>
    </div>
  );
};

export default ExpenseSummaryMockup;
