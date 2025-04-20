import { AddCustomTraitModal, VisuallyHiddenInput } from '@components';
import {
  addToast,
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
} from '@heroui/react';
import { useTextField, useFileField, useUser } from '@hooks';
import { CloudArrowUp, Plus } from '@phosphor-icons/react';
import { useHabitActions, useTraits } from '@stores';
import { getErrorMessage } from '@utils';
import React from 'react';

const AddHabitDialogButton = () => {
  const { user } = useUser();
  const traits = useTraits();
  const { addHabit } = useHabitActions();
  const [open, setOpen] = React.useState(false);
  const [name, handleNameChange, clearName] = useTextField();
  const [description, handleDescriptionChange, clearDescription] =
    useTextField();
  const [icon, handleIconChange, clearIcon] = useFileField();
  const [traitId, setTraitId] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);
  const [addTraitModalOpen, setAddTraitModalOpen] = React.useState(false);

  const handleDialogOpen = () => {
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
    clearName();
    clearDescription();
    setTraitId('');
    clearIcon();
  };

  const handleAdd = async () => {
    if (!user) {
      return null;
    }

    setIsAdding(true);

    try {
      await addHabit(
        {
          name,
          description,
          userId: user.id,
          traitId: +traitId,
        },
        icon
      );

      addToast({
        title: 'Habit added successfully',
        description: 'Your habit has been added successfully.',
        color: 'success',
      });

      handleDialogClose();
    } catch (error) {
      console.error(error);
      addToast({
        title: 'Something went wrong while adding your habit',
        description: `Error details: ${getErrorMessage(error)}`,
        color: 'danger',
      });
    } finally {
      setIsAdding(false);
    }

    handleDialogClose();
  };

  return (
    <>
      <Button
        color="primary"
        variant="solid"
        isDisabled={!user}
        startContent={<Plus weight="bold" />}
        onPress={handleDialogOpen}
        data-testid="add-habit-button"
        className="w-full lg:w-auto"
      >
        Add habit
      </Button>
      <AddCustomTraitModal
        open={addTraitModalOpen}
        onClose={() => {
          return setAddTraitModalOpen(false);
        }}
      />
      <Modal isOpen={open} role="add-habit-dialog" onClose={handleDialogClose}>
        <ModalContent>
          <ModalHeader>Add New Habit</ModalHeader>
          <ModalBody>
            <Input
              required
              value={name}
              onChange={handleNameChange}
              label="Name"
              placeholder="Enter habit name"
              variant="faded"
            />
            <Textarea
              value={description}
              onChange={handleDescriptionChange}
              label="Description"
              placeholder="Enter habit description (optional)"
              variant="faded"
            />
            <Select
              required
              label="Choose a trait"
              selectedKeys={[traitId]}
              data-testid="habit-select"
              variant="faded"
            >
              {traits.map((trait) => {
                return (
                  <SelectItem
                    key={trait.id.toString()}
                    onPress={() => {
                      setTraitId(trait.id.toString());
                    }}
                    textValue={trait.name}
                  >
                    {trait.name}
                  </SelectItem>
                );
              })}
            </Select>
            <Button
              variant="ghost"
              size="sm"
              color="secondary"
              startContent={<Plus />}
              onPress={() => {
                return setAddTraitModalOpen(true);
              }}
            >
              Or add a custom trait
            </Button>
            <Button
              fullWidth
              as="label"
              size="sm"
              color="secondary"
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
              isDisabled={!user?.id || !name || !traitId}
              isLoading={isAdding}
              type="submit"
              color="primary"
              onPress={handleAdd}
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
