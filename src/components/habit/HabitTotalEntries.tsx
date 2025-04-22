import { getHabitTotalEntries } from '@services';
import React from 'react';

const HabitTotalEntries = ({ id }: { id: number }) => {
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
