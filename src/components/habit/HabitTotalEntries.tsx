import React from 'react';

import type { Habit } from '@models';
import { getHabitTotalEntries } from '@services';

const HabitTotalEntries = ({ id }: { id: Habit['id'] }) => {
  const [entriesCount, setEntriesCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    getHabitTotalEntries(id).then(setEntriesCount);
  }, [id]);

  return entriesCount ? (
    <span>{entriesCount}</span>
  ) : (
    <span className="text-gray-400">–</span>
  );
};

export default HabitTotalEntries;
