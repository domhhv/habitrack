import {
  cn,
  Input,
  Button,
  Spinner,
  Textarea,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import { XIcon, CheckIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import React from 'react';

import { TraitChip, MetricDefinitionForm } from '@components';
import type { Habit, FormMetricDefinitions } from '@models';
import {
  useUser,
  useTraits,
  useHabitActions,
  useMetricsActions,
} from '@stores';
import { handleAsyncAction } from '@utils';

import HabitIcon from './HabitIcon';

type HabitDetailsProps = {
  habit: Habit;
};

const HabitDetails = ({ habit }: HabitDetailsProps) => {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [name, setName] = React.useState(habit.name);
  const [isEditingDescription, setIsEditingDescription] = React.useState(false);
  const [description, setDescription] = React.useState(habit.description || '');
  const [isEditingMotivation, setIsEditingMotivation] = React.useState(false);
  const [motivation, setMotivation] = React.useState(habit.motivation || '');
  const [isEditingMetrics, setIsEditingMetrics] = React.useState(false);
  const [metricDefinitions, setMetricDefinitions] = React.useState<
    FormMetricDefinitions[]
  >([]);
  const [isSavingMetrics, setIsSavingMetrics] = React.useState(false);
  const [isUpdatingTrait, setIsUpdatingTrait] = React.useState(false);
  const traits = useTraits();
  const user = useUser();
  const { updateHabit } = useHabitActions();
  const { addHabitMetrics, removeHabitMetrics, updateHabitMetric } =
    useMetricsActions();

  const isEditing = React.useMemo(() => {
    return isEditingName || isEditingDescription || isEditingMotivation;
  }, [isEditingName, isEditingDescription, isEditingMotivation]);

  const startEditingMetrics = () => {
    const localMetrics = habit.metricDefinitions.map((m) => {
      return {
        config: m.config as FormMetricDefinitions['config'],
        id: m.id,
        isPersisted: true,
        isRequired: m.isRequired,
        name: m.name,
        sortOrder: m.sortOrder,
        type: m.type,
      };
    });
    setMetricDefinitions(localMetrics);
    setIsEditingMetrics(true);
  };

  const cancelEditingMetrics = () => {
    setMetricDefinitions([]);
    setIsEditingMetrics(false);
  };

  const addMetric = () => {
    setMetricDefinitions((prev) => {
      return [
        ...prev,
        {
          config: {},
          id: `form-${Date.now()}`,
          isBeingEdited: true,
          isRequired: false,
          name: 'Unnamed metric',
          sortOrder: prev.length,
          type: 'number',
        },
      ];
    });
  };

  const saveMetrics = async () => {
    if (!user) {
      return;
    }

    const submit = async () => {
      const metricsToRemove = metricDefinitions
        .filter((md) => {
          return md.isToBeRemoved;
        })
        .map((md) => {
          return md.id;
        });

      if (metricsToRemove.length > 0) {
        await removeHabitMetrics(metricsToRemove, habit.id);
      }

      const metricsToAdd = metricDefinitions
        .filter((md) => {
          return md.isToBeAdded && !md.isToBeRemoved;
        })
        .map((metric) => {
          return {
            config: metric.config,
            habitId: habit.id,
            isRequired: metric.isRequired,
            name: metric.name,
            sortOrder: metric.sortOrder,
            type: metric.type,
            userId: user.id,
          };
        });

      const metricsToUpdate = metricDefinitions.filter((md) => {
        return md.isToBeUpdated && !md.isToBeRemoved;
      });

      if (metricsToAdd.length > 0) {
        await addHabitMetrics(metricsToAdd);
      }

      if (metricsToUpdate.length > 0) {
        await Promise.all(
          metricsToUpdate.map((metric) => {
            return updateHabitMetric(metric.id, {
              config: metric.config,
              isRequired: metric.isRequired,
              name: metric.name,
              sortOrder: metric.sortOrder,
              type: metric.type,
            });
          })
        );
      }
    };

    void handleAsyncAction(submit(), 'update_habit', setIsSavingMetrics).then(
      () => {
        setIsEditingMetrics(false);
      }
    );
  };

  const saveHabit = async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const trimmedMotivation = motivation.trim();

    if (isEditingName && !trimmedName) {
      return;
    }

    if (trimmedName !== habit.name) {
      await updateHabit(habit.id, { name: trimmedName });
    }

    if (trimmedDescription !== (habit.description || '')) {
      await updateHabit(habit.id, { description: trimmedDescription || null });
    }

    if (trimmedMotivation !== (habit.motivation || '')) {
      await updateHabit(habit.id, { motivation: trimmedMotivation || null });
    }

    setIsEditingName(false);
    setIsEditingDescription(false);
    setIsEditingMotivation(false);
  };

  const cancelEditing = () => {
    setName(habit.name);
    setDescription(habit.description || '');
    setMotivation(habit.motivation || '');
    setIsEditingName(false);
    setIsEditingDescription(false);
    setIsEditingMotivation(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (isEditingName && !name.trim()) {
        return;
      }

      void saveHabit();
    }

    if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <div className="flex flex-col gap-10 py-8">
      <div className="flex gap-4">
        <div
          style={{ borderColor: habit.trait?.color || '' }}
          className="border-content3 justify-self-start rounded-2xl border-3 p-4"
        >
          <HabitIcon habit={habit} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {isEditingName ? (
              <Input
                autoFocus
                size="sm"
                value={name}
                maxLength={50}
                placeholder="Untitled"
                onValueChange={setName}
                onKeyDown={handleKeyDown}
                classNames={{
                  innerWrapper: 'py-2',
                  inputWrapper: 'h-auto',
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
                      onPress={saveHabit}
                      aria-label="Save name"
                      isDisabled={!name.trim()}
                    >
                      <CheckIcon className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      isIconOnly
                      variant="light"
                      onPress={cancelEditing}
                      aria-label="Cancel name editing"
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
                  aria-label="Edit name"
                  onPress={() => {
                    setName(habit.name);
                    setIsEditingName(true);
                  }}
                  className={cn(
                    'opacity-0 transition-opacity group-hover:opacity-100',
                    isEditing && 'invisible'
                  )}
                >
                  <PencilSimpleIcon className="size-4" />
                </Button>
              </div>
            )}
            <Dropdown backdrop="opaque" isDisabled={isUpdatingTrait}>
              <DropdownTrigger>
                <button type="button" className="h-5 cursor-pointer space-x-2">
                  <TraitChip
                    trait={habit.trait}
                    className="hover:bg-content2"
                  />
                  {isUpdatingTrait && (
                    <Spinner
                      size="sm"
                      variant="wave"
                      classNames={{
                        wrapper: 'translate-0 h-0',
                      }}
                    />
                  )}
                </button>
              </DropdownTrigger>
              <DropdownMenu
                selectionMode="single"
                aria-label="Select trait"
                selectedKeys={new Set([habit.traitId || 'no-trait'])}
                onAction={async (key) => {
                  const nextTraitId = key === 'no-trait' ? null : String(key);
                  const currentTraitId = habit.traitId ?? null;

                  if (isUpdatingTrait || nextTraitId === currentTraitId) {
                    return;
                  }

                  setIsUpdatingTrait(true);

                  try {
                    await updateHabit(habit.id, {
                      traitId: nextTraitId,
                    });
                  } finally {
                    setIsUpdatingTrait(false);
                  }
                }}
              >
                {[
                  <DropdownItem key="no-trait" textValue="No trait">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-black" />
                      No trait
                    </div>
                  </DropdownItem>,
                  ...Object.values(traits).map((trait) => {
                    return (
                      <DropdownItem key={trait.id} textValue={trait.name}>
                        <div className="flex items-center gap-2">
                          <span
                            style={{ backgroundColor: trait.color }}
                            className="inline-block h-2 w-2 rounded-full"
                          />
                          {trait.name}
                        </div>
                      </DropdownItem>
                    );
                  }),
                ]}
              </DropdownMenu>
            </Dropdown>
          </div>
          {isEditingDescription ? (
            <Input
              autoFocus
              size="sm"
              maxLength={100}
              value={description}
              onKeyDown={handleKeyDown}
              placeholder="No description"
              onValueChange={setDescription}
              classNames={{
                innerWrapper: 'py-2',
                inputWrapper: 'h-auto',
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
                    onPress={saveHabit}
                    aria-label="Save description"
                  >
                    <CheckIcon className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    isIconOnly
                    variant="light"
                    onPress={cancelEditing}
                    aria-label="Cancel description editing"
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
                aria-label="Edit description"
                onPress={() => {
                  setDescription(habit.description || '');
                  setIsEditingDescription(true);
                }}
                className={cn(
                  'opacity-0 transition-opacity group-hover:opacity-100',
                  isEditing && 'invisible'
                )}
              >
                <PencilSimpleIcon className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      {isEditingMotivation ? (
        <Textarea
          maxLength={2000}
          label="Motivation"
          value={motivation}
          onValueChange={setMotivation}
          placeholder="Why do you want to track this habit? If you know the reasons for establishing a good habit or breaking a bad one, this is a good place to outline your goals."
          endContent={
            <div className="flex items-center gap-1">
              <span className="text-foreground-400 text-tiny whitespace-nowrap">
                {motivation.length}/2000
              </span>
              <Button
                size="sm"
                isIconOnly
                variant="light"
                onPress={saveHabit}
                aria-label="Save motivation"
              >
                <CheckIcon className="size-4" />
              </Button>
              <Button
                size="sm"
                isIconOnly
                variant="light"
                onPress={cancelEditing}
                aria-label="Cancel motivation editing"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          }
        />
      ) : (
        <div className="group">
          <h2 className="mt-4 mb-1 text-sm font-medium">Motivation</h2>
          <div className="flex gap-2">
            <p
              className={cn(
                !habit.motivation && 'text-default-500 italic',
                'whitespace-pre-wrap'
              )}
            >
              {habit.motivation || 'No motivation set'}
            </p>
            <Button
              size="sm"
              isIconOnly
              variant="light"
              aria-label="Edit motivation"
              onPress={() => {
                setMotivation(habit.motivation || '');
                setIsEditingMotivation(true);
              }}
              className={cn(
                'opacity-0 transition-opacity group-hover:opacity-100',
                isEditing && 'invisible'
              )}
            >
              <PencilSimpleIcon className="size-4" />
            </Button>
          </div>
        </div>
      )}
      <div className="group">
        <div className="mb-1 flex items-center gap-2">
          <h2 className="text-sm font-medium">Metrics</h2>
          {!isEditingMetrics && (
            <Button
              size="sm"
              isIconOnly
              variant="light"
              aria-label="Edit metrics"
              onPress={startEditingMetrics}
              className={cn(
                'opacity-0 transition-opacity group-hover:opacity-100',
                isEditing && 'invisible'
              )}
            >
              <PencilSimpleIcon className="size-4" />
            </Button>
          )}
        </div>
        {isEditingMetrics ? (
          <div className="flex flex-col gap-3">
            {metricDefinitions.map((md) => {
              return (
                <MetricDefinitionForm
                  key={md.id}
                  metric={md}
                  onChange={(metricUpdates) => {
                    setMetricDefinitions((prev) => {
                      return prev.map((prevMd) => {
                        if (prevMd.id === md.id) {
                          return {
                            ...prevMd,
                            ...metricUpdates,
                            isToBeUpdated: md.isPersisted,
                          };
                        }

                        return prevMd;
                      });
                    });
                  }}
                  onRemove={() => {
                    setMetricDefinitions((prev) => {
                      if (!md.isPersisted) {
                        return prev.filter((prevMd) => {
                          return prevMd.id !== md.id;
                        });
                      }

                      return prev.map((prevMd) => {
                        if (prevMd.id === md.id) {
                          return {
                            ...prevMd,
                            isToBeRemoved: true,
                          };
                        }

                        return prevMd;
                      });
                    });
                  }}
                />
              );
            })}
            <Button
              size="sm"
              className="min-h-8"
              onPress={addMetric}
              isDisabled={isSavingMetrics}
            >
              Add metric
            </Button>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                color="primary"
                onPress={saveMetrics}
                isDisabled={!user?.id}
                isLoading={isSavingMetrics}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="light"
                isDisabled={isSavingMetrics}
                onPress={cancelEditingMetrics}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {habit.metricDefinitions.length > 0 ? (
              <ul className="list-inside list-disc space-y-1">
                {habit.metricDefinitions.map((md) => {
                  return (
                    <li key={md.id} className="text-sm">
                      {md.name}{' '}
                      <span className="text-default-500">({md.type})</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-default-500 italic">No metrics</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitDetails;
