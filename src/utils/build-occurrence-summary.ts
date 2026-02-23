import groupBy from 'lodash.groupby';

import type { Occurrence, OccurrenceSummaryItem } from '@models';

const buildOccurrenceSummary = (
  occurrencesById: Record<string, Occurrence>
): OccurrenceSummaryItem[] => {
  const allOccurrences = Object.values(occurrencesById);

  const grouped = groupBy(allOccurrences, (o) => {
    return o.habitId;
  });

  return Object.entries(grouped).map(([habitId, habitOccurrences]) => {
    const [first] = habitOccurrences;

    return {
      count: habitOccurrences.length,
      habitId,
      iconPath: first.habit.iconPath,
      name: first.habit.name,
      occurrences: habitOccurrences,
      traitColor: first.habit.trait?.color || 'black',
    };
  });
};

export default buildOccurrenceSummary;
