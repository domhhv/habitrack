export type TraitDotColor = 'amber' | 'green' | 'rose';

export const TRAIT_DOT_CLASSES: Record<TraitDotColor, string> = {
  amber: 'bg-(--warning)',
  green: 'bg-(--accent)',
  rose: 'bg-(--danger)',
};

export const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const RUNNING_DAYS = [2, 4, 7, 9, 11, 14, 16, 18, 21, 23, 25, 28, 30];
const COFFEE_REST_DAYS = [5, 12, 19, 26];
const SNACK_DAYS = [3, 5, 12, 17, 26];

export const dotsForDay = (day: number) => {
  const dots: TraitDotColor[] = [];

  if (!COFFEE_REST_DAYS.includes(day)) {
    dots.push('amber');
  }

  if (RUNNING_DAYS.includes(day)) {
    dots.push('green');
  }

  if (SNACK_DAYS.includes(day)) {
    dots.push('rose');
  }

  return dots;
};
