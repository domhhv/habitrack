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

import { useTextField } from '@hooks';
import type { Habit } from '@models';
import { useUser, useTraits, useHabitActions } from '@stores';
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
  const { updateHabit } = useHabitActions();
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

    void handleAsyncAction(
      updateHabit(habit.id, {
        description,
        name,
        traitId,
      }),
      'update_habit',
      setIsUpdating
    ).then(handleClose);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      role="edit-habit-modal"
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
