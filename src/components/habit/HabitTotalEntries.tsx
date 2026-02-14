type HabitTotalEntriesProps = {
  count: number | null;
};

const HabitTotalEntries = ({ count }: HabitTotalEntriesProps) => {
  return count ? (
    <span>{count}</span>
  ) : (
    <span className="text-gray-400">–</span>
  );
};

export default HabitTotalEntries;
