import { FloatingLabelInput, FloatingLabelTextarea } from '@components';
import { useHabits, useTraits } from '@context';
import type { Habit } from '@models';
import {
  Button,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
} from '@mui/joy';
import { useUser } from '@supabase/auth-helpers-react';
import React from 'react';

import { StyledTraitColorIndicator } from '../styled';

import { StyledForm } from './styled';

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
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [traitId, setTraitId] = React.useState<number>(0);
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
      setTraitId(habit.traitId);
    }
  }, [habit, traitsMap]);

  if (!isOpen || !habit) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(event.target.value);
  };

  const handleTraitChange = (_: null, newValue: number) => {
    setTraitId(newValue);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const updatedAt = new Date();
    updatedAt.setMilliseconds(0);
    updatedAt.setSeconds(0);
    event.preventDefault();
    setIsUpdating(true);
    const newHabit = {
      name,
      description,
      traitId,
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
      open={open}
      onClose={handleClose}
      role="edit-habit-modal"
      data-visible={isOpen.toString()}
    >
      <ModalDialog>
        <ModalClose data-testid="close-icon" onClick={handleClose} />
        <DialogTitle>Edit habit</DialogTitle>
        <DialogContent>
          <StyledForm onSubmit={handleSubmit} role="edit-habit-form">
            <FloatingLabelInput
              value={name}
              onChange={handleNameChange}
              label="Name"
              placeholder="Edit habit name"
              variant="soft"
              color="neutral"
              disabled={isUpdating}
            />
            <FloatingLabelTextarea
              value={description}
              onChange={handleDescriptionChange}
              label="Description (optional)"
              placeholder="Edit habit description"
              variant="soft"
              color="neutral"
              disabled={isUpdating}
            />
            <Select
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              onChange={handleTraitChange}
              required
              disabled={isUpdating}
              placeholder="Choose a trait"
              value={traitId}
              variant="soft"
            >
              <Option value={0} disabled>
                Choose a trait
              </Option>
              {allTraits.map((trait) => (
                <Option key={trait.id} value={trait.id}>
                  {trait.label}
                  <StyledTraitColorIndicator
                    sx={{
                      backgroundColor: traitsMap[trait.id]?.color,
                    }}
                  />
                </Option>
              ))}
            </Select>
            <Button
              role="submit-edited-habit-button"
              type="submit"
              fullWidth
              loading={isUpdating}
            >
              Done
            </Button>
          </StyledForm>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default EditHabitDialog;
