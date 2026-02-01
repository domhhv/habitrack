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
import React from 'react';

import { MetricDefinitionForm, type LocalMetricDefinition } from '@components';
import { useTextField } from '@hooks';
import type { Habit } from '@models';
import {
  useUser,
  useTraits,
  useHabitActions,
  useMetricsActions,
} from '@stores';
import { handleAsyncAction } from '@utils';

type EditHabitDialogProps = {
  habit: Habit | null;
  onClose?: () => void;
};

const EditHabitDialog = ({ habit, onClose }: EditHabitDialogProps) => {
  const { isOpen, onClose: onDisclosureClose, onOpen } = useDisclosure();
  const [name, handleNameChange] = useTextField();
  const [description, handleDescriptionChange] = useTextField();
  const [traitId, setTraitId] = React.useState('');
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [metricDefinitions, setMetricDefinitions] = React.useState<
    LocalMetricDefinition[]
  >([]);
  const [initialMetricIds, setInitialMetricIds] = React.useState<Set<string>>(
    new Set()
  );

  const { updateHabit } = useHabitActions();
  const { addHabitMetric, removeHabitMetric, updateHabitMetric } =
    useMetricsActions();
  const traits = useTraits();
  const { user } = useUser();

  React.useEffect(() => {
    if (habit) {
      onOpen();
    } else {
      onClose?.();
    }
  }, [habit, onOpen, onClose]);

  React.useEffect(() => {
    if (habit) {
      handleNameChange(habit.name);
      handleDescriptionChange(habit.description || '');
      setTraitId(habit.traitId.toString());

      const localMetrics: LocalMetricDefinition[] = habit.metricDefinitions.map(
        (m) => {
          return {
            config: m.config as LocalMetricDefinition['config'],
            id: m.id,
            isRequired: m.isRequired,
            name: m.name,
            sortOrder: m.sortOrder,
            type: m.type,
          };
        }
      );
      setMetricDefinitions(localMetrics);
      setInitialMetricIds(
        new Set(
          habit.metricDefinitions.map((m) => {
            return m.id;
          })
        )
      );
    }
  }, [habit, handleNameChange, handleDescriptionChange]);

  if (!habit) {
    return null;
  }

  const handleClose = () => {
    onDisclosureClose();
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!user) {
      return null;
    }

    const submit = async () => {
      await updateHabit(habit.id, {
        description,
        name,
        traitId,
      });

      const currentIds = new Set(
        metricDefinitions
          .filter((m) => {
            return !m.id.startsWith('local-');
          })
          .map((m) => {
            return m.id;
          })
      );

      const deletedIds = [...initialMetricIds].filter((id) => {
        return !currentIds.has(id);
      });
      await Promise.all(
        deletedIds.map((id) => {
          return removeHabitMetric(id, habit.id);
        })
      );

      await Promise.all(
        metricDefinitions.map((metric) => {
          if (metric.id.startsWith('local-')) {
            return addHabitMetric({
              config: metric.config,
              habitId: habit.id,
              isRequired: metric.isRequired,
              name: metric.name,
              sortOrder: metric.sortOrder,
              type: metric.type,
              userId: user.id,
            });
          }

          return updateHabitMetric(metric.id, {
            config: metric.config,
            isRequired: metric.isRequired,
            name: metric.name,
            sortOrder: metric.sortOrder,
            type: metric.type,
          });
        })
      );
    };

    void handleAsyncAction(submit(), 'update_habit', setIsUpdating).then(
      handleClose
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      scrollBehavior="inside"
      data-visible={isOpen.toString()}
    >
      <ModalContent>
        <ModalHeader>Edit habit</ModalHeader>
        <ModalBody>
          <Input
            value={name}
            label="Name"
            variant="faded"
            isDisabled={isUpdating}
            onChange={handleNameChange}
            placeholder="Edit habit name"
          />
          <Textarea
            variant="faded"
            value={description}
            isDisabled={isUpdating}
            label="Description (optional)"
            onChange={handleDescriptionChange}
            placeholder="Edit habit description"
          />
          <Select
            required
            label="Trait"
            variant="faded"
            selectedKeys={[traitId]}
            data-testid="habit-select"
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

          <MetricDefinitionForm
            metrics={metricDefinitions}
            onChange={setMetricDefinitions}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            fullWidth
            type="submit"
            color="primary"
            isLoading={isUpdating}
            onPress={handleSubmit}
            isDisabled={!user?.id}
            role="submit-edited-habit-button"
          >
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditHabitDialog;
