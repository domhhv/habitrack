import { FloatingLabelInput, FloatingLabelTextarea } from '@components';
import { useHabits, useSnackbar } from '@context';
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
import { patchHabit } from '@services';
import {
  useSession,
  useSupabaseClient,
  useUser,
} from '@supabase/auth-helpers-react';
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
  const session = useSession();
  const { fetchingHabits, addingHabit, addHabit } = useHabits();
  const [open, setOpen] = React.useState(false);
  const [habitName, setHabitName] = React.useState('');
  const [habitDescription, setHabitDescription] = React.useState('');
  const [habitTrait, setHabitTrait] = React.useState<'good' | 'bad' | ''>('');
  const [habitIcon, setHabitIcon] = React.useState<File | null>(null);
  const supabase = useSupabaseClient();
  const { showSnackbar } = useSnackbar();

  const handleDialogOpen = () => {
    setOpen(true);
  };

  const handleDialogClose = () => {
    setHabitName('');
    setHabitDescription('');
    setHabitTrait('');
    setOpen(false);
  };

  const handleAdd: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    try {
      const habit = {
        name: habitName,
        description: habitDescription,
        trait: habitTrait as 'good' | 'bad',
        user_id: user?.id || session?.user?.id || '',
      };

      let icon_path = '';

      const { id } = await addHabit(habit);

      showSnackbar('Habit added, uploading icon...', {
        variant: 'soft',
        color: 'success',
      });

      if (habitIcon) {
        const { data } = await supabase.storage
          .from('habit_icons')
          .upload(`habit-id-${id}`, habitIcon, {
            cacheControl: '3600',
            upsert: false,
          });

        icon_path = data?.path || '';
      }

      await patchHabit(id, { icon_path });

      showSnackbar('Icon uploaded', {
        variant: 'soft',
        color: 'success',
      });

      handleDialogClose();
    } catch (error) {
      console.error(error);
    } finally {
      setOpen(false);
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

  const handleHabitTraitChange = (_: null, newValue: string) => {
    setHabitTrait(newValue as 'good' | 'bad');
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
        color="primary"
        variant="soft"
        startDecorator={<AddRounded />}
        onClick={handleDialogOpen}
        disabled={fetchingHabits || !session?.user?.id}
      >
        Add habit
      </Button>
      <Modal open={open} onClose={handleDialogClose}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogContent>
            <form onSubmit={handleAdd}>
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
                  placeholder="Choose a trait"
                  value={habitTrait}
                  endDecorator={
                    <>
                      {habitTrait === 'good' ? (
                        <CheckCircleOutline color="success" fontSize="small" />
                      ) : habitTrait === 'bad' ? (
                        <WarningAmber color="warning" fontSize="small" />
                      ) : null}
                    </>
                  }
                >
                  <Option value="good">Good</Option>
                  <Option value="bad">Bad</Option>
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
