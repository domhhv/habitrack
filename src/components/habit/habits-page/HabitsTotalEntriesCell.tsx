import React from 'react';

import { getHabitTotalEntries } from '@services';

const HabitsTotalEntriesCell = ({ id }: { id: number }) => {
  const [entriesCount, setEntriesCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    getHabitTotalEntries(id).then(setEntriesCount);
  }, [id]);

  return entriesCount ? (
    <p className="text-right">{entriesCount}</p>
  ) : (
    <p className="text-right text-gray-400">–</p>
  );
};

export default HabitsTotalEntriesCell;
