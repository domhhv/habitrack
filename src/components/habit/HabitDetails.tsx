import {
  cn,
  Label,
  Dropdown,
  TextField,
  FieldError,
  InputGroup,
} from '@heroui/react';
import { XIcon, CheckIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import React from 'react';
import { href } from 'react-router';

import {
  TraitChip,
  ActionForm,
  CustomButton,
  HabitStockManager,
  MetricDefinitionForm,
} from '@components';
import { HABIT_FIELD_LIMITS } from '@const';
import { useUser, useTraits, useActionFetcher } from '@hooks';
import type { Habit, FormMetricDefinitions } from '@models';

import HabitIcon from './HabitIcon';

type HabitDetailsProps = {
  habit: Habit;
};

type EditableHabitField = 'name' | 'description' | 'motivation';

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
  const traits = useTraits();
  const user = useUser();
  const habitFetcher = useActionFetcher(() => {
    setIsEditingName(false);
    setIsEditingDescription(false);
    setIsEditingMotivation(false);
  });
  const traitFetcher = useActionFetcher();
  const metricsFetcher = useActionFetcher(() => {
    setIsEditingMetrics(false);
  });
  const isUpdatingTrait = traitFetcher.state !== 'idle';
  const isSavingMetrics = metricsFetcher.state !== 'idle';

  const habitAction = href('/habits/:habitId', { habitId: habit.id });

  const isEditing = React.useMemo(() => {
    return isEditingName || isEditingDescription || isEditingMotivation;
  }, [isEditingName, isEditingDescription, isEditingMotivation]);

  const startEditingMetrics = () => {
    const localMetrics = habit.metricDefinitions.map((m) => {
      return {
        config: m.config,
        id: m.id,
        isPersisted: true,
        isRequired: m.isRequired,
        name: m.name,
        presetName: '',
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
          isToBeAdded: true,
          name: 'Unnamed metric',
          presetName: '',
          sortOrder: prev.length,
          type: 'number',
        },
      ];
    });
  };

  const saveMetrics = () => {
    void metricsFetcher.submit(
      {
        intent: 'save-metrics',
        metricDefinitions: JSON.stringify(metricDefinitions),
      },
      { action: habitAction, method: 'post' }
    );
  };

  const cancelEditing = () => {
    setName(habit.name);
    setDescription(habit.description || '');
    setMotivation(habit.motivation || '');
    setIsEditingName(false);
    setIsEditingDescription(false);
    setIsEditingMotivation(false);
  };

  const skipUnchangedSubmit = (
    event: React.SyntheticEvent,
    field: EditableHabitField,
    value: string
  ) => {
    if (habitFetcher.state !== 'idle') {
      event.preventDefault();

      return;
    }

    if (value.trim() === (habit[field] || '')) {
      event.preventDefault();
      cancelEditing();
    }
  };

  const cancelOnEscape = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <div className="flex flex-col gap-10 py-8">
      <div className="flex gap-4">
        <div className="space-y-2">
          <div
            style={{ borderColor: habit.trait?.color || '' }}
            className="border-border justify-self-start rounded-2xl border-3 p-4"
          >
            <HabitIcon habit={habit} />
          </div>
          <Dropdown>
            <Dropdown.Trigger>
              <TraitChip trait={habit.trait} className="hover:bg-background" />
            </Dropdown.Trigger>
            <Dropdown.Popover>
              <Dropdown.Menu
                selectionMode="single"
                aria-label="Select trait"
                selectedKeys={new Set([habit.traitId || 'no-trait'])}
                onAction={(key) => {
                  const nextTraitId = key === 'no-trait' ? null : String(key);
                  const currentTraitId = habit.traitId ?? null;

                  if (isUpdatingTrait || nextTraitId === currentTraitId) {
                    return;
                  }

                  void traitFetcher.submit(
                    { intent: 'update-habit', traitId: nextTraitId ?? '' },
                    { action: habitAction, method: 'post' }
                  );
                }}
              >
                {[
                  <Dropdown.Item
                    id="no-trait"
                    key="no-trait"
                    textValue="No trait"
                  >
                    <Label>
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-black" />
                        No trait
                      </div>
                    </Label>
                  </Dropdown.Item>,
                  ...Object.values(traits).map((trait) => {
                    return (
                      <Dropdown.Item
                        id={trait.id}
                        key={trait.id}
                        textValue={trait.name}
                      >
                        <Label>
                          <div className="flex items-center gap-2">
                            <span
                              style={{ backgroundColor: trait.color }}
                              className="inline-block h-2 w-2 rounded-full"
                            />
                            {trait.name}
                          </div>
                        </Label>
                      </Dropdown.Item>
                    );
                  }),
                ]}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
        <div className="space-y-2">
          {isEditingName ? (
            <ActionForm
              action={habitAction}
              fetcher={habitFetcher}
              className="flex items-center gap-1"
              onSubmit={(event) => {
                skipUnchangedSubmit(event, 'name', name);
              }}
            >
              <input type="hidden" name="intent" value="update-habit" />
              <TextField isRequired name="name" className="w-96">
                <InputGroup>
                  <InputGroup.Input
                    value={name}
                    onKeyDown={cancelOnEscape}
                    placeholder="Enter habit name"
                    maxLength={HABIT_FIELD_LIMITS.name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  />
                  <InputGroup.Suffix className="space-x-2">
                    <span className="text-foreground-400 text-tiny whitespace-nowrap">
                      {name.length}/{HABIT_FIELD_LIMITS.name}
                    </span>
                    <CustomButton
                      size="sm"
                      isIconOnly
                      type="submit"
                      variant="ghost"
                      aria-label="Save name"
                    >
                      <CheckIcon className="size-4" />
                    </CustomButton>
                    <CustomButton
                      size="sm"
                      isIconOnly
                      variant="ghost"
                      onPress={cancelEditing}
                      aria-label="Cancel name editing"
                    >
                      <XIcon className="size-4" />
                    </CustomButton>
                  </InputGroup.Suffix>
                </InputGroup>
                <FieldError />
              </TextField>
            </ActionForm>
          ) : (
            <div className="group flex items-center gap-2">
              <h1 className="text-2xl font-bold">{habit.name}</h1>
              <CustomButton
                size="sm"
                isIconOnly
                variant="ghost"
                aria-label="Edit name"
                onPress={() => {
                  setName(habit.name);
                  setIsEditingName(true);
                }}
                className={cn(
                  'transition-opacity group-hover:opacity-100 lg:opacity-0',
                  isEditing && 'invisible'
                )}
              >
                <PencilSimpleIcon className="size-4" />
              </CustomButton>
            </div>
          )}
          {isEditingDescription ? (
            <ActionForm
              action={habitAction}
              fetcher={habitFetcher}
              className="flex items-center gap-1"
              onSubmit={(event) => {
                skipUnchangedSubmit(event, 'description', description);
              }}
            >
              <input type="hidden" name="intent" value="update-habit" />
              <TextField className="w-96" name="description">
                <InputGroup>
                  <InputGroup.Input
                    autoFocus
                    value={description}
                    onKeyDown={cancelOnEscape}
                    placeholder="No description"
                    maxLength={HABIT_FIELD_LIMITS.description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                    }}
                  />
                  <InputGroup.Suffix className="space-x-2">
                    <span className="text-foreground-400 text-tiny whitespace-nowrap">
                      {description.length}/{HABIT_FIELD_LIMITS.description}
                    </span>
                    <CustomButton
                      size="sm"
                      isIconOnly
                      type="submit"
                      variant="ghost"
                      aria-label="Save description"
                    >
                      <CheckIcon className="size-4" />
                    </CustomButton>
                    <CustomButton
                      size="sm"
                      isIconOnly
                      variant="ghost"
                      onPress={cancelEditing}
                      aria-label="Cancel description editing"
                    >
                      <XIcon className="size-4" />
                    </CustomButton>
                  </InputGroup.Suffix>
                </InputGroup>
                <FieldError />
              </TextField>
            </ActionForm>
          ) : (
            <div className="group flex items-center gap-2">
              <p
                className={cn(!habit.description && 'text-default-500 italic')}
              >
                {habit.description || 'No description'}
              </p>
              <CustomButton
                size="sm"
                isIconOnly
                variant="ghost"
                aria-label="Edit description"
                onPress={() => {
                  setDescription(habit.description || '');
                  setIsEditingDescription(true);
                }}
                className={cn(
                  'transition-opacity group-hover:opacity-100 lg:opacity-0',
                  isEditing && 'invisible'
                )}
              >
                <PencilSimpleIcon className="size-4" />
              </CustomButton>
            </div>
          )}
        </div>
      </div>
      {isEditingMotivation ? (
        <ActionForm
          action={habitAction}
          fetcher={habitFetcher}
          onSubmit={(event) => {
            skipUnchangedSubmit(event, 'motivation', motivation);
          }}
        >
          <input type="hidden" name="intent" value="update-habit" />
          <TextField fullWidth name="motivation" className="flex flex-col">
            <InputGroup>
              <InputGroup.TextArea
                className="h-24"
                value={motivation}
                maxLength={HABIT_FIELD_LIMITS.motivation}
                onChange={(e) => {
                  setMotivation(e.target.value);
                }}
                placeholder="Why do you want to track this habit? If you know the reasons for establishing a good habit or breaking a bad one, this is a good place to outline your goals."
              />
              <InputGroup.Suffix className="items-center space-x-2 self-end py-2">
                <span className="text-foreground-400 text-tiny whitespace-nowrap">
                  {motivation.length}/{HABIT_FIELD_LIMITS.motivation}
                </span>
                <CustomButton
                  size="sm"
                  isIconOnly
                  type="submit"
                  variant="ghost"
                  aria-label="Save motivation"
                >
                  <CheckIcon className="size-4" />
                </CustomButton>
                <CustomButton
                  size="sm"
                  isIconOnly
                  variant="ghost"
                  onPress={cancelEditing}
                  aria-label="Cancel motivation editing"
                >
                  <XIcon className="size-4" />
                </CustomButton>
              </InputGroup.Suffix>
            </InputGroup>
            <FieldError />
          </TextField>
        </ActionForm>
      ) : (
        <div className="group">
          <h2 className="mt-4 mb-1 text-sm font-medium">Motivation</h2>
          <div className="flex items-center gap-2">
            <p
              className={cn(
                !habit.motivation && 'text-default-500 italic',
                'whitespace-pre-wrap'
              )}
            >
              {habit.motivation || 'No motivation set'}
            </p>
            <CustomButton
              size="sm"
              isIconOnly
              variant="ghost"
              aria-label="Edit motivation"
              onPress={() => {
                setMotivation(habit.motivation || '');
                setIsEditingMotivation(true);
              }}
              className={cn(
                'transition-opacity group-hover:opacity-100 lg:opacity-0',
                isEditing && 'invisible'
              )}
            >
              <PencilSimpleIcon className="size-4" />
            </CustomButton>
          </div>
        </div>
      )}
      <div className="group">
        <div className="mb-1 flex items-center gap-2">
          <h2 className="text-sm font-medium">Metrics</h2>
          {!isEditingMetrics && (
            <CustomButton
              size="sm"
              isIconOnly
              variant="ghost"
              aria-label="Edit metrics"
              onPress={startEditingMetrics}
              className={cn(
                'transition-opacity group-hover:opacity-100 lg:opacity-0',
                isEditing && 'invisible'
              )}
            >
              <PencilSimpleIcon className="size-4" />
            </CustomButton>
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
            <CustomButton
              className="min-h-8"
              onPress={addMetric}
              isDisabled={isSavingMetrics}
            >
              Add metric
            </CustomButton>
            <div className="flex items-center gap-2">
              <CustomButton
                variant="primary"
                onPress={saveMetrics}
                isPending={isSavingMetrics}
                isDisabled={isSavingMetrics || !user?.id}
              >
                Save
              </CustomButton>
              <CustomButton
                variant="ghost"
                isDisabled={isSavingMetrics}
                onPress={cancelEditingMetrics}
              >
                Cancel
              </CustomButton>
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
      <HabitStockManager habit={habit} />
    </div>
  );
};

export default HabitDetails;
