import { cn, Input, Button } from '@heroui/react';
import { XIcon, CheckIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import React from 'react';

import { TraitChip } from '@components';
import type { Habit } from '@models';
import { StorageBuckets } from '@models';
import { getPublicUrl } from '@services';
import { useHabitActions } from '@stores';

type HabitDetailsProps = {
  habit: Habit;
};

const HabitDetails = ({ habit }: HabitDetailsProps) => {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [name, setName] = React.useState(habit.name);
  const [isEditingDescription, setIsEditingDescription] = React.useState(false);
  const [description, setDescription] = React.useState(habit.description || '');
  const { updateHabit } = useHabitActions();

  const handleNameSave = async () => {
    const trimmed = name.trim();

    if (trimmed && trimmed !== habit.name) {
      await updateHabit(habit.id, { name: trimmed });
    }

    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setName(habit.name);
    setIsEditingName(false);
  };

  const handleDescriptionSave = async () => {
    const trimmed = description.trim();

    if (trimmed !== (habit.description || '')) {
      await updateHabit(habit.id, { description: trimmed || null });
    }

    setIsEditingDescription(false);
  };

  const handleDescriptionCancel = () => {
    setDescription(habit.description || '');
    setIsEditingDescription(false);
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
            {isEditingName ? (
              <Input
                autoFocus
                size="sm"
                value={name}
                maxLength={50}
                onValueChange={setName}
                classNames={{
                  innerWrapper: 'py-2',
                  input: 'text-2xl font-bold',
                  inputWrapper: 'h-auto',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNameSave();
                  }

                  if (e.key === 'Escape') {
                    handleNameCancel();
                  }
                }}
                endContent={
                  <div className="flex items-center gap-1">
                    <span className="text-foreground-400 text-tiny whitespace-nowrap">
                      {name.length}/50
                    </span>
                    <Button
                      size="sm"
                      isIconOnly
                      variant="light"
                      onPress={handleNameSave}
                      isDisabled={!name.trim()}
                    >
                      <CheckIcon className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      isIconOnly
                      variant="light"
                      onPress={handleNameCancel}
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
                    setIsEditingName(true);
                  }}
                >
                  <PencilSimpleIcon className="size-4" />
                </Button>
              </div>
            )}
            {habit.trait && <TraitChip trait={habit.trait} />}
          </div>
          {isEditingDescription ? (
            <Input
              autoFocus
              size="sm"
              maxLength={100}
              value={description}
              placeholder="No description"
              onValueChange={setDescription}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleDescriptionSave();
                }

                if (e.key === 'Escape') {
                  handleDescriptionCancel();
                }
              }}
              endContent={
                <div className="flex items-center gap-1">
                  <span className="text-foreground-400 text-tiny whitespace-nowrap">
                    {description.length}/100
                  </span>
                  <Button
                    size="sm"
                    isIconOnly
                    variant="light"
                    onPress={handleDescriptionSave}
                  >
                    <CheckIcon className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    isIconOnly
                    variant="light"
                    onPress={handleDescriptionCancel}
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="group flex items-center gap-2">
              <p
                className={cn(!habit.description && 'text-default-500 italic')}
              >
                {habit.description || 'No description'}
              </p>
              <Button
                size="sm"
                isIconOnly
                variant="light"
                className="opacity-0 transition-opacity group-hover:opacity-100"
                onPress={() => {
                  setDescription(habit.description || '');
                  setIsEditingDescription(true);
                }}
              >
                <PencilSimpleIcon className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitDetails;
