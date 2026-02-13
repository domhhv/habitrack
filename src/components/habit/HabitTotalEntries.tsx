type HabitTotalEntriesProps = {
  count: number | null | undefined;
};

const HabitTotalEntries = ({ count }: HabitTotalEntriesProps) => {
  return count ? (
    <span>{count}</span>
  ) : (
    <span className="text-gray-400">–</span>
  );
};

export default HabitTotalEntries;
