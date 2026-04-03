import {
  Label,
  Modal,
  Button,
  Select,
  ListBox,
  Spinner,
  InputGroup,
  useOverlayState,
} from '@heroui/react';
import { PlusIcon, CloudArrowUpIcon } from '@phosphor-icons/react';
import React from 'react';

import {
  AddTraitModal,
  VisuallyHiddenInput,
  MetricDefinitionForm,
} from '@components';
import { useTextField, useFileField } from '@hooks';
import type { FormMetricDefinitions } from '@models';
import { uploadHabitIcon } from '@services';
import {
  useUser,
  useTraits,
  useHabitActions,
  useMetricsActions,
} from '@stores';
import { handleAsyncAction } from '@utils';

const AddHabitDialogButton = () => {
  const [traitId, setTraitId] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);
  const [metricDefinitions, setMetricDefinitions] = React.useState<
    FormMetricDefinitions[]
  >([]);

  const traits = useTraits();
  const user = useUser();
  const { addHabit } = useHabitActions();
  const { addHabitMetrics } = useMetricsActions();
  const [icon, handleIconChange, clearIcon] = useFileField();
  const [name, handleNameChange, clearName] = useTextField();
  const [description, handleDescriptionChange, clearDescription] =
    useTextField();

  const addDialogState = useOverlayState();
  const traitModalState = useOverlayState();

  const clearFields = React.useCallback(() => {
    clearName();
    clearDescription();
    clearIcon();
    setTraitId('');
    setMetricDefinitions([]);
  }, [clearName, clearDescription, clearIcon]);

  React.useEffect(() => {
    if (!addDialogState.isOpen) {
      clearFields();
    }
  }, [addDialogState.isOpen, clearFields]);

  const handleAdd = async () => {
    if (!user) {
      return null;
    }

    const add = async () => {
      const iconPath = icon ? await uploadHabitIcon(user.id, icon) : '';

      const habit = await addHabit({
        description,
        iconPath,
        name,
        traitId: traitId || null,
        userId: user.id,
      });

      if (metricDefinitions.length > 0) {
        await addHabitMetrics(
          metricDefinitions.map((metric) => {
            return {
              config: metric.config,
              habitId: habit.id,
              isRequired: metric.isRequired,
              name: metric.name,
              sortOrder: metric.sortOrder,
              type: metric.type,
              userId: user.id,
            };
          })
        );
      }
    };

    void handleAsyncAction(add(), 'add_habit', setIsAdding)
      .then(addDialogState.close)
      .then(clearFields);
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
          presetName: '',
          sortOrder: prev.length,
          type: 'number',
        },
      ];
    });
  };

  return (
    <>
      <AddTraitModal
        isOpen={traitModalState.isOpen}
        onClose={traitModalState.close}
      />

      <Button
        variant="primary"
        onPress={addDialogState.open}
        data-testid="add-habit-button"
      >
        <PlusIcon weight="bold" />
        Add habit
      </Button>

      <Modal state={addDialogState}>
        <Modal.Backdrop>
          <Modal.Container size="lg">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Add New Habit</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <InputGroup>
                  <InputGroup.Input
                    required
                    value={name}
                    maxLength={50}
                    onChange={handleNameChange}
                    placeholder="Enter habit name"
                  />
                  <InputGroup.Suffix>
                    <span className="text-foreground-400 text-tiny whitespace-nowrap">
                      {name.length}/50
                    </span>
                  </InputGroup.Suffix>
                </InputGroup>
                <InputGroup>
                  <InputGroup.Input
                    maxLength={100}
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Enter habit description (optional)"
                  />
                  <InputGroup.Suffix>
                    <span className="text-foreground-400 text-tiny whitespace-nowrap">
                      {description.length}/100
                    </span>
                  </InputGroup.Suffix>
                </InputGroup>
                <Select
                  value={traitId || null}
                  placeholder="Choose a trait"
                  onChange={(key) => {
                    setTraitId(typeof key === 'string' ? key : '');
                  }}
                >
                  <Label>Choose a trait</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {Object.values(traits).map((trait) => {
                        return (
                          <ListBox.Item
                            textValue={trait.name}
                            id={trait.id.toString()}
                            key={trait.id.toString()}
                          >
                            {trait.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        );
                      })}
                    </ListBox>
                  </Select.Popover>
                </Select>
                <Button
                  size="sm"
                  variant="ghost"
                  className="min-h-8"
                  onPress={traitModalState.open}
                >
                  <PlusIcon />
                  Or add a new trait
                </Button>
                <label className="rounded-medium border-default-200 hover:bg-default-100 flex min-h-8 w-full cursor-pointer items-center justify-center gap-2 border px-4 py-2 text-sm">
                  <CloudArrowUpIcon />
                  Upload habit icon
                  <VisuallyHiddenInput onChange={handleIconChange} />
                </label>
                {icon && <p>{icon.name}</p>}

                {metricDefinitions.map((md) => {
                  return (
                    <MetricDefinitionForm
                      key={md.id}
                      metric={md}
                      onRemove={() => {
                        setMetricDefinitions((prev) => {
                          return prev.filter((prevMd) => {
                            return prevMd.id !== md.id;
                          });
                        });
                      }}
                      onChange={(metricUpdates) => {
                        setMetricDefinitions((prev) => {
                          return prev.map((prevMd) => {
                            if (prevMd.id === md.id) {
                              return {
                                ...prevMd,
                                ...metricUpdates,
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
                  isDisabled={isAdding}
                >
                  Add metric
                </Button>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  fullWidth
                  type="submit"
                  variant="primary"
                  onPress={handleAdd}
                  isDisabled={isAdding || !user?.id || !name}
                >
                  {isAdding && <Spinner size="sm" />}
                  Submit
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
};

export default AddHabitDialogButton;
