import { useHabits, useTraits } from '@context';
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
import { useUser } from '@supabase/auth-helpers-react';
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
  const [name, handleNameChange, , setName] = useTextField();
  const [description, handleDescriptionChange, , setDescription] =
    useTextField();
  const [traitId, setTraitId] = React.useState('');
  const [isUpdating, setIsUpdating] = React.useState(false);
  const { updateHabit } = useHabits();
  const user = useUser();
  const { allTraits, traitsMap } = useTraits();

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  React.useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description);
      setTraitId(habit.traitId.toString());
    }
  }, [habit, traitsMap, setName, setDescription]);

  if (!isOpen || !habit) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleSubmit = async () => {
    const updatedAt = new Date();
    updatedAt.setMilliseconds(0);
    updatedAt.setSeconds(0);
    setIsUpdating(true);
    const newHabit = {
      name,
      description,
      traitId: +traitId,
      userId: user?.id as string,
      iconPath: habit.iconPath,
      createdAt: habit.createdAt,
      updatedAt: updatedAt.toISOString(),
    };
    await updateHabit(habit.id, newHabit);
    setIsUpdating(false);
    handleClose();
  };

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
          />
          <Textarea
            value={description}
            onChange={handleDescriptionChange}
            label="Description (optional)"
            placeholder="Edit habit description"
            isDisabled={isUpdating}
          />
          <Select
            required
            label="Trait"
            selectedKeys={[traitId]}
            data-testid="habit-select"
          >
            {allTraits.map((trait) => (
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
