import { AddCustomTraitModal } from '@components';
import { useHabits, useSnackbar, useTraits } from '@context';
import { useTextField } from '@hooks';
import { useFileField } from '@hooks';
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
  Typography,
} from '@mui/joy';
import { Input, Textarea } from '@nextui-org/react';
import { StorageBuckets, uploadFile } from '@services';
import { useUser } from '@supabase/auth-helpers-react';
import React, { type FormEventHandler } from 'react';

import { StyledTraitColorIndicator, VisuallyHiddenInput } from '../styled';

const AddHabitDialogButton = () => {
  const user = useUser();
  const { showSnackbar } = useSnackbar();
  const { allTraits, traitsMap } = useTraits();
  const { fetchingHabits, addingHabit, addHabit, updateHabit } = useHabits();
  const [open, setOpen] = React.useState(false);
  const [name, handleNameChange, clearName] = useTextField();
  const [description, handleDescriptionChange, clearDescription] =
    useTextField();
  const [icon, handleIconChange, clearIcon] = useFileField();
  const [traitId, setTraitId] = React.useState('choose-trait');
  const [addTraitModalOpen, setAddTraitModalOpen] = React.useState(false);

  const handleDialogOpen = () => {
    setOpen(true);
  };

  const handleDialogClose = () => {
    clearName();
    clearDescription();
    setTraitId('');
    clearIcon();
    setOpen(false);
  };

  const handleAdd: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    try {
      const habit = {
        name,
        description,
        userId: user?.id || '',
        traitId: traitId as unknown as number,
      };

      const { id } = await addHabit(habit);

      if (icon) {
        const [, extension] = icon.name.split('.');
        const iconPath = `${user?.id}/habit-id-${id}.${extension}`;
        await uploadFile(StorageBuckets.HABIT_ICONS, iconPath, icon);
        void updateHabit(id, { ...habit, iconPath });
      }
    } catch (error) {
      console.error(error);

      showSnackbar('Something went wrong while adding your habit', {
        color: 'danger',
      });
    } finally {
      handleDialogClose();
    }
  };

  const handleHabitTraitChange = (
    _: null,
    newTraitId: string | 'add-custom-trait'
  ) => {
    if (newTraitId === 'add-custom-trait') {
      return setAddTraitModalOpen(true);
    }

    setTraitId(newTraitId);
  };

  return (
    <>
      <Button
        sx={{ width: 400, maxWidth: '100%' }}
        color="primary"
        variant="solid"
        startDecorator={<AddRounded />}
        onClick={handleDialogOpen}
        disabled={fetchingHabits || !user?.id}
        data-testid="add-habit-button"
      >
        Add habit
      </Button>
      <AddCustomTraitModal
        open={addTraitModalOpen}
        onClose={() => setAddTraitModalOpen(false)}
      />
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
                <Input
                  required
                  value={name}
                  onChange={handleNameChange}
                  label="Name"
                  placeholder="Enter habit name"
                />
              </Box>
              <Box mb={1}>
                <Textarea
                  value={description}
                  onChange={handleDescriptionChange}
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
                  value={traitId}
                  endDecorator={
                    <>
                      {traitsMap[traitId]?.slug === 'good' ? (
                        <CheckCircleOutline color="success" fontSize="small" />
                      ) : traitsMap[traitId]?.slug === 'bad' ? (
                        <WarningAmber color="warning" fontSize="small" />
                      ) : null}
                    </>
                  }
                >
                  <Option value="choose-trait" disabled>
                    Choose a trait
                  </Option>
                  {allTraits.map((trait) => (
                    <Option
                      key={trait.id}
                      value={trait.id}
                      data-testid={`habit-trait-id-${trait.id}-option`}
                    >
                      {trait.label}
                      <StyledTraitColorIndicator
                        sx={{ backgroundColor: trait.color }}
                      />
                    </Option>
                  ))}
                  <Option value="add-custom-trait">
                    <AddRounded /> Add Custom Trait
                  </Option>
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
                    onChange={handleIconChange}
                    role="habit-icon-input"
                  />
                </Button>
                {icon && <Typography level="body-md">{icon.name}</Typography>}
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
