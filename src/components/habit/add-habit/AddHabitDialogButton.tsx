import { AddCustomTraitModal, VisuallyHiddenInput } from '@components';
import { useHabits, useSnackbar, useTraits } from '@context';
import { useTextField } from '@hooks';
import { useFileField } from '@hooks';
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
import { CloudArrowUp, Plus } from '@phosphor-icons/react';
import { StorageBuckets, uploadFile } from '@services';
import { useUser } from '@supabase/auth-helpers-react';
import React from 'react';

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
  const [traitId, setTraitId] = React.useState('');
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

  const handleAdd = async () => {
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

  return (
    <>
      <Button
        fullWidth
        color="primary"
        variant="solid"
        startContent={<Plus />}
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
      <Modal isOpen={open} onClose={handleDialogClose} role="add-habit-dialog">
        <ModalContent>
          <ModalHeader>Add New Habit</ModalHeader>
          <ModalBody>
            <Input
              required
              value={name}
              onChange={handleNameChange}
              label="Name"
              placeholder="Enter habit name"
            />
            <Textarea
              value={description}
              onChange={handleDescriptionChange}
              label="Description"
              placeholder="Enter habit description (optional)"
            />
            <Select
              required
              label="Choose a trait"
              selectedKeys={[traitId]}
              data-testid="habit-select"
            >
              {allTraits.map((trait) => (
                <SelectItem
                  key={trait.id.toString()}
                  onClick={() => {
                    setTraitId(trait.id.toString());
                  }}
                  textValue={trait.label}
                >
                  <span>{trait.label}</span>
                  <span className="font-regular ml-2 text-neutral-400">
                    {traitsMap[trait.id]?.label}
                  </span>
                </SelectItem>
              ))}
            </Select>
            <Button
              variant="bordered"
              size="sm"
              startContent={<Plus />}
              onClick={() => setAddTraitModalOpen(true)}
            >
              Or add a custom trait
            </Button>
            <Button
              fullWidth
              as="label"
              variant="flat"
              size="sm"
              color="primary"
              startContent={<CloudArrowUp />}
            >
              Upload Icon
              <VisuallyHiddenInput onChange={handleIconChange} />
            </Button>
            {icon && <p>{icon.name}</p>}
          </ModalBody>
          <ModalFooter>
            <Button
              fullWidth
              isLoading={addingHabit}
              type="submit"
              color="primary"
              onClick={handleAdd}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddHabitDialogButton;
