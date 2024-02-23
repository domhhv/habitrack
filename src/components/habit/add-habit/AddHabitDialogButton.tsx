import { FloatingLabelInput, FloatingLabelTextarea } from '@components';
import { useHabits, useSnackbar, useTraits } from '@context';
import {
  AddRounded,
  CheckCircleOutline,
  WarningAmber,
} from '@mui/icons-material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import {
  Box,
  Button,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  styled,
  Typography,
} from '@mui/joy';
import { StorageBuckets, uploadFile } from '@services';
import { useUser } from '@supabase/auth-helpers-react';
import React, { type FormEventHandler } from 'react';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: '1px',
});

const AddHabitDialogButton = () => {
  const user = useUser();
  const { showSnackbar } = useSnackbar();
  const { allTraits, traitsMap } = useTraits();
  const { fetchingHabits, addingHabit, addHabit, updateHabit } = useHabits();
  const [open, setOpen] = React.useState(false);
  const [habitName, setHabitName] = React.useState('');
  const [habitDescription, setHabitDescription] = React.useState('');
  const [habitTraitId, setHabitTraitId] = React.useState(0);
  const [habitIcon, setHabitIcon] = React.useState<File | null>(null);

  const handleDialogOpen = () => {
    setOpen(true);
  };

  const handleDialogClose = () => {
    setHabitName('');
    setHabitDescription('');
    setHabitTraitId(0);
    setOpen(false);
  };

  const handleAdd: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    try {
      const habit = {
        name: habitName,
        description: habitDescription,
        userId: user?.id || '',
        iconPath: '',
        traitId: habitTraitId as number,
      };

      const { id } = await addHabit(habit);

      if (habitIcon) {
        const [, extension] = habitIcon.name.split('.');
        const { data } = await uploadFile(
          StorageBuckets.HABIT_ICONS,
          `${user?.id}/habit-id-${id}.${extension}`,
          habitIcon
        );
        await updateHabit(id, { ...habit, iconPath: data?.path });
      }
    } catch (error) {
      console.error(error);

      showSnackbar('Something went wrong while adding your habit', {
        variant: 'soft',
        color: 'danger',
      });
    } finally {
      handleDialogClose();
    }
  };

  const handleHabitNameChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setHabitName(event.target.value);
  };

  const handleHabitDescriptionChange: React.ChangeEventHandler<
    HTMLTextAreaElement
  > = (event) => {
    setHabitDescription(event.target.value);
  };

  const handleHabitTraitChange = (_: null, newTraitId: number) => {
    setHabitTraitId(newTraitId);
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setHabitIcon(file);
    }
  };

  return (
    <>
      <Button
        sx={{ width: 400 }}
        color="primary"
        variant="solid"
        startDecorator={<AddRounded />}
        onClick={handleDialogOpen}
        disabled={fetchingHabits || !user?.id}
        data-testid="add-habit-button"
      >
        Add habit
      </Button>
      <Modal open={open} onClose={handleDialogClose} role="add-habit-dialog">
        <ModalDialog>
          <ModalClose
            role="close-add-habit-dialog-button"
            onClick={handleDialogClose}
          />
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogContent>
            <form onSubmit={handleAdd} role="add-habit-form">
              <Box mb={1}>
                <FloatingLabelInput
                  required
                  value={habitName}
                  onChange={handleHabitNameChange}
                  label="Name"
                  placeholder="Enter habit name"
                />
              </Box>
              <Box mb={1}>
                <FloatingLabelTextarea
                  value={habitDescription}
                  onChange={handleHabitDescriptionChange}
                  label="Description"
                  placeholder="Enter habit description (optional)"
                />
              </Box>
              <Box mb={1}>
                <Select
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  onChange={handleHabitTraitChange}
                  required
                  data-testid="habit-trait-select"
                  placeholder="Choose a trait"
                  value={habitTraitId}
                  endDecorator={
                    <>
                      {traitsMap[habitTraitId]?.slug === 'good' ? (
                        <CheckCircleOutline color="success" fontSize="small" />
                      ) : traitsMap[habitTraitId]?.slug === 'bad' ? (
                        <WarningAmber color="warning" fontSize="small" />
                      ) : null}
                    </>
                  }
                >
                  {allTraits.map((trait) => (
                    <Option
                      key={trait.id}
                      value={trait.id}
                      data-testid={`habit-trait-id-${trait.id}-option`}
                    >
                      {trait.name}
                    </Option>
                  ))}
                </Select>
              </Box>
              <Box mb={1}>
                <Button
                  fullWidth
                  component="label"
                  variant="outlined"
                  color="neutral"
                  startDecorator={<CloudUploadOutlinedIcon />}
                >
                  Upload Icon
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    role="habit-icon-input"
                  />
                </Button>
                {habitIcon && (
                  <Typography level="body-md">{habitIcon.name}</Typography>
                )}
              </Box>
              <Box mt={1}>
                <Button fullWidth loading={addingHabit} type="submit">
                  Submit
                </Button>
              </Box>
            </form>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default AddHabitDialogButton;
