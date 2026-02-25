import { Input, Button } from '@heroui/react';
import { XIcon, CheckIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { TraitChip } from '@components';
import type { Habit } from '@models';
import { StorageBuckets } from '@models';
import { getPublicUrl } from '@services';
import { useHabitActions } from '@stores';

type HabitDetailsProps = {
  habit: Habit;
};

const HabitDetails = ({ habit }: HabitDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const { updateHabit } = useHabitActions();

  const handleSave = async () => {
    const trimmed = name.trim();

    if (trimmed && trimmed !== habit.name) {
      await updateHabit(habit.id, { name: trimmed });
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(habit.name);
    setIsEditing(false);
  };

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
            {isEditing ? (
              <Input
                autoFocus
                size="sm"
                value={name}
                onValueChange={setName}
                classNames={{
                  innerWrapper: 'py-2',
                  input: 'text-2xl font-bold',
                  inputWrapper: 'h-auto',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }

                  if (e.key === 'Escape') {
                    handleCancel();
                  }
                }}
                endContent={
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      isIconOnly
                      variant="light"
                      onPress={handleSave}
                      isDisabled={!name.trim()}
                    >
                      <CheckIcon className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      isIconOnly
                      variant="light"
                      onPress={handleCancel}
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>
                }
              />
            ) : (
              <div className="group flex items-center gap-2">
                <h1 className="text-2xl font-bold">{habit.name}</h1>
                <Button
                  size="sm"
                  isIconOnly
                  variant="light"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  onPress={() => {
                    setName(habit.name);
                    setIsEditing(true);
                  }}
                >
                  <PencilSimpleIcon className="size-4" />
                </Button>
              </div>
            )}
            {habit.trait && <TraitChip trait={habit.trait} />}
          </div>
          {habit.description && <p>{habit.description}</p>}
        </div>
      </div>
    </div>
  );
};

export default HabitDetails;
