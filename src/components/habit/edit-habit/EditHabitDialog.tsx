import { FloatingLabelInput, FloatingLabelTextarea } from '@components';
import { useHabits } from '@context';
import { useTraits } from '@hooks';
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
  const [trait, setTrait] = React.useState<string>('');
  const [isUpdating, setIsUpdating] = React.useState(false);
  const { updateHabit } = useHabits();
  const user = useUser();
  const { traitsMap } = useTraits();

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  React.useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description);
      setTrait(traitsMap[habit.traitId].slug);
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

  const handleTraitChange = (_: null, newValue: string) => {
    setTrait(newValue);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const updatedAt = new Date();
    updatedAt.setMilliseconds(0);
    event.preventDefault();
    setIsUpdating(true);
    const newHabit = {
      name,
      description,
      traitId: habit.traitId,
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
    <Modal open={open} onClose={handleClose}>
      <ModalDialog>
        <ModalClose data-testid="close-icon" onClick={handleClose} />
        <DialogTitle>Edit habit</DialogTitle>
        <DialogContent>
          <StyledForm onSubmit={handleSubmit} role="form">
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
              value={trait}
              variant="soft"
              color={trait === 'good' ? 'success' : 'danger'}
            >
              <Option key="good" value="good">
                Good
              </Option>
              <Option key="bad" value="bad">
                Bad
              </Option>
            </Select>
            <Button type="submit" fullWidth loading={isUpdating}>
              Done
            </Button>
          </StyledForm>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default EditHabitDialog;
