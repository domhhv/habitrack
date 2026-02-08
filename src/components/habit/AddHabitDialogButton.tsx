import {
  Input,
  Modal,
  Button,
  Select,
  Textarea,
  ModalBody,
  SelectItem,
  ModalFooter,
  ModalHeader,
  ModalContent,
  useDisclosure,
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
  const { user } = useUser();
  const { addHabit } = useHabitActions();
  const { addHabitMetric } = useMetricsActions();
  const [icon, handleIconChange, clearIcon] = useFileField();
  const [name, handleNameChange, clearName] = useTextField();
  const [description, handleDescriptionChange, clearDescription] =
    useTextField();

  const {
    isOpen: isAddDialogOpen,
    onClose: closeAddDialog,
    onOpen: openAddDialog,
  } = useDisclosure();
  const {
    isOpen: isTraitModalOpen,
    onClose: closeTraitModal,
    onOpen: openTraitModal,
  } = useDisclosure();

  const clearFields = React.useCallback(() => {
    clearName();
    clearDescription();
    clearIcon();
    setTraitId('');
    setMetricDefinitions([]);
  }, [clearName, clearDescription, clearIcon]);

  React.useEffect(() => {
    if (!isAddDialogOpen) {
      clearFields();
    }
  }, [isAddDialogOpen, clearFields]);

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
        traitId,
        userId: user.id,
      });

      if (metricDefinitions.length > 0) {
        await Promise.all(
          metricDefinitions.map((metric) => {
            return addHabitMetric({
              config: metric.config,
              habitId: habit.id,
              isRequired: metric.isRequired,
              name: metric.name,
              sortOrder: metric.sortOrder,
              type: metric.type,
              userId: user.id,
            });
          })
        );
      }
    };

    void handleAsyncAction(add(), 'add_habit', setIsAdding)
      .then(closeAddDialog)
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
          sortOrder: prev.length,
          type: 'number',
        },
      ];
    });
  };

  return (
    <>
      <AddTraitModal isOpen={isTraitModalOpen} onClose={closeTraitModal} />

      <Button
        color="primary"
        variant="solid"
        onPress={openAddDialog}
        data-testid="add-habit-button"
        startContent={<PlusIcon weight="bold" />}
      >
        Add habit
      </Button>

      <Modal
        size="lg"
        role="add-habit-dialog"
        scrollBehavior="inside"
        isOpen={isAddDialogOpen}
        onClose={closeAddDialog}
      >
        <ModalContent>
          <ModalHeader>Add New Habit</ModalHeader>
          <ModalBody>
            <Input
              required
              size="sm"
              value={name}
              label="Name"
              variant="faded"
              onChange={handleNameChange}
              placeholder="Enter habit name"
            />
            <Textarea
              size="sm"
              variant="faded"
              value={description}
              label="Description"
              onChange={handleDescriptionChange}
              placeholder="Enter habit description (optional)"
            />
            <Select
              required
              size="sm"
              isClearable
              variant="faded"
              label="Choose a trait"
              selectedKeys={[traitId]}
              onClear={() => {
                setTraitId('');
              }}
            >
              {Object.values(traits).map((trait) => {
                return (
                  <SelectItem
                    textValue={trait.name}
                    key={trait.id.toString()}
                    onPress={() => {
                      setTraitId(trait.id.toString());
                    }}
                  >
                    {trait.name}
                  </SelectItem>
                );
              })}
            </Select>
            <Button
              size="sm"
              variant="ghost"
              className="min-h-8"
              onPress={openTraitModal}
              startContent={<PlusIcon />}
            >
              Or add a new trait
            </Button>
            <Button
              fullWidth
              size="sm"
              as="label"
              className="min-h-8"
              startContent={<CloudArrowUpIcon />}
            >
              Upload habit icon
              <VisuallyHiddenInput onChange={handleIconChange} />
            </Button>
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
          </ModalBody>
          <ModalFooter>
            <Button
              fullWidth
              type="submit"
              color="primary"
              onPress={handleAdd}
              isLoading={isAdding}
              isDisabled={!user?.id || !name}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddHabitDialogButton;
