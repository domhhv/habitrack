import { TraitChip } from '@components';
import type { Habit } from '@models';
import { StorageBuckets } from '@models';
import { getPublicUrl } from '@services';

type HabitDetailsProps = {
  habit: Habit;
};

const HabitDetails = ({ habit }: HabitDetailsProps) => {
  return (
    <div className="flex flex-col gap-10 py-8">
      <div className="flex gap-4">
        <div
          style={{ borderColor: habit.trait?.color || '' }}
          className="border-content3 justify-self-start rounded-2xl border-3 p-4"
        >
          <img
            className="size-12"
            alt={`${habit.name} icon`}
            src={getPublicUrl(StorageBuckets.HABIT_ICONS, habit.iconPath)}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{habit.name}</h1>
            {habit.trait && <TraitChip trait={habit.trait} />}
          </div>
          {habit.description && <p>{habit.description}</p>}
        </div>
      </div>
    </div>
  );
};

export default HabitDetails;
