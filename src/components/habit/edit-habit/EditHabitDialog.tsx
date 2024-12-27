import { useTextField } from '@hooks';
import type { Habit } from '@models';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
} from '@nextui-org/react';
import { useHabitsStore, useTraitsStore } from '@stores';
import { useUser } from '@supabase/auth-helpers-react';
import { toEventLike } from '@utils';
import React from 'react';

export type EditHabitDialogProps = {
  habit: Habit | null;
  onClose?: () => void;
};

const EditHabitDialog = ({ habit, onClose }: EditHabitDialogProps) => {
  const { isOpen, onOpen, onClose: onDisclosureClose } = useDisclosure();
  const [name, handleNameChange] = useTextField();
  const [description, handleDescriptionChange] = useTextField();
  const [traitId, setTraitId] = React.useState('');
  const { updateHabit, habitIdBeingUpdated } = useHabitsStore();
  const { traits } = useTraitsStore();
  const user = useUser();

  React.useEffect(() => {
    if (habit) {
      onOpen();
    } else {
      onClose?.();
    }
  }, [habit, onOpen, onClose]);

  React.useEffect(() => {
    if (habit) {
      handleNameChange(toEventLike(habit.name));
      handleDescriptionChange(toEventLike(habit.description || ''));
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

    await updateHabit(habit.id, user.id, {
      name,
      description,
      traitId: +traitId,
    });

    handleClose();
  };

  const isUpdating = habitIdBeingUpdated === habit.id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      role="edit-habit-modal"
      data-visible={isOpen.toString()}
      isDismissable={!user?.id}
    >
      <ModalContent>
        <ModalHeader>Edit habit</ModalHeader>
        <ModalBody>
          <Input
            value={name}
            onChange={handleNameChange}
            label="Name"
            placeholder="Edit habit name"
            isDisabled={isUpdating}
            variant="faded"
          />
          <Textarea
            value={description}
            onChange={handleDescriptionChange}
            label="Description (optional)"
            placeholder="Edit habit description"
            isDisabled={isUpdating}
            variant="faded"
          />
          <Select
            required
            label="Trait"
            selectedKeys={[traitId]}
            data-testid="habit-select"
            variant="faded"
          >
            {traits.map((trait) => (
              <SelectItem
                key={trait.id.toString()}
                onClick={() => {
                  setTraitId(trait.id.toString());
                }}
                textValue={trait.name}
              >
                {trait.name}
              </SelectItem>
            ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button
            fullWidth
            type="submit"
            color="primary"
            isLoading={isUpdating}
            role="submit-edited-habit-button"
            onClick={handleSubmit}
            isDisabled={!user?.id}
          >
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditHabitDialog;
