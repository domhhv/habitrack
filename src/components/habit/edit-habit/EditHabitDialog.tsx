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
} from '@nextui-org/react';
import { useHabitsStore, useTraitsStore } from '@stores';
import { useUser } from '@supabase/auth-helpers-react';
import { toEventLike } from '@utils';
import React from 'react';

export type EditHabitDialogProps = {
  open: boolean;
  habit: Habit | null;
  onClose?: () => void;
};

const EditHabitDialog = ({
  open = false,
  habit,
  onClose,
}: EditHabitDialogProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, handleNameChange] = useTextField();
  const [description, handleDescriptionChange] = useTextField();
  const [traitId, setTraitId] = React.useState('');
  const { updateHabit, habitIdBeingUpdated } = useHabitsStore();
  const { traits } = useTraitsStore();
  const user = useUser();

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  React.useEffect(() => {
    if (habit) {
      handleNameChange(toEventLike(habit.name));
      handleDescriptionChange(toEventLike(habit.description || ''));
      setTraitId(habit.traitId.toString());
    }
  }, [habit, handleNameChange, handleDescriptionChange]);

  if (!isOpen || !habit) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
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
      isOpen={open}
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
