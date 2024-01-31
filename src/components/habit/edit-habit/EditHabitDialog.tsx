import { FloatingLabelInput, FloatingLabelTextarea } from '@components';
import {
  Habit,
  useCalendarEvents,
  useHabits,
  useSnackbar,
  useUser,
} from '@context';
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
import { habitService } from '@services';
import React from 'react';

import { StyledForm } from './styled';

type EditHabitDialogProps = {
  open: boolean;
  habit: Habit | undefined;
  onClose?: () => void;
};

const EditHabitDialog = ({
  open = false,
  habit,
  onClose,
}: EditHabitDialogProps) => {
  const {
    user: { token },
  } = useUser();
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [trait, setTrait] = React.useState<'good' | 'bad' | ''>('');
  const [isUpdating, setIsUpdating] = React.useState(false);
  const habitsContext = useHabits();
  const { updateHabitInsideCalendarEvents } = useCalendarEvents();
  const { showSnackbar } = useSnackbar();

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  React.useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description);
      setTrait(habit.trait);
    }
  }, [habit]);

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

  const handleTraitChange = (_: null, newValue: 'good' | 'bad') => {
    setTrait(newValue);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUpdating(true);

    try {
      const updatedHabit = await habitService.updateHabit(
        habit.id,
        {
          name,
          description,
          trait: trait as 'good' | 'bad',
        },
        token
      );
      habitsContext.updateHabit(updatedHabit);
      updateHabitInsideCalendarEvents(updatedHabit);
      showSnackbar('Your habit has been updated!', {
        color: 'success',
        dismissible: true,
        dismissText: 'Done',
      });
    } catch (error) {
      showSnackbar('Something went wrong', {
        color: 'danger',
        dismissible: true,
      });
      console.error(error);
    } finally {
      setIsUpdating(false);
      handleClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog>
        <ModalClose />
        <DialogTitle>Edit habit</DialogTitle>
        <DialogContent>
          <StyledForm onSubmit={handleSubmit}>
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
