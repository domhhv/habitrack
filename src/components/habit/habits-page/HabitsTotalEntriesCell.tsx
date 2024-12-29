import { getHabitTotalEntries } from '@services';
import React from 'react';

const HabitsTotalEntriesCell = ({ id }: { id: number }) => {
  const [entriesCount, setEntriesCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    getHabitTotalEntries(id).then(setEntriesCount);
  }, [id]);

  return entriesCount ? (
    <p>{entriesCount}</p>
  ) : (
    <p className="text-gray-400">–</p>
  );
};

export default HabitsTotalEntriesCell;
