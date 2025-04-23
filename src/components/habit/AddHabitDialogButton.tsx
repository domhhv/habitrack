import {
  Input,
  Modal,
  Button,
  Select,
  Textarea,
  ModalBody,
  SelectItem,
  ModalFooter,
  ModalHeader,
  ModalContent,
} from '@heroui/react';
import { Plus, CloudArrowUp } from '@phosphor-icons/react';
import React from 'react';

import { AddCustomTraitModal, VisuallyHiddenInput } from '@components';
import { handleAsyncAction } from '@helpers';
import { useUser, useTextField, useFileField } from '@hooks';
import { uploadHabitIcon } from '@services';
import { useTraits, useHabitActions } from '@stores';

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

    const add = async () => {
      const iconPath = icon ? await uploadHabitIcon(user.id, icon) : '';

      return addHabit({
        description,
        iconPath,
        name,
        traitId: +traitId,
        userId: user.id,
      });
    };

    void handleAsyncAction(add(), 'add_habit', setIsAdding).then(
      handleDialogClose
    );
  };

  return (
    <>
      <Button
        color="primary"
        variant="solid"
        isDisabled={!user}
        onPress={handleDialogOpen}
        className="w-full lg:w-auto"
        data-testid="add-habit-button"
        startContent={<Plus weight="bold" />}
      >
        Add habit
      </Button>
      <AddCustomTraitModal
        isOpen={addTraitModalOpen}
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
              label="Name"
              variant="faded"
              onChange={handleNameChange}
              placeholder="Enter habit name"
            />
            <Textarea
              variant="faded"
              value={description}
              label="Description"
              onChange={handleDescriptionChange}
              placeholder="Enter habit description (optional)"
            />
            <Select
              required
              variant="faded"
              label="Choose a trait"
              selectedKeys={[traitId]}
              data-testid="habit-select"
            >
              {traits.map((trait) => {
                return (
                  <SelectItem
                    textValue={trait.name}
                    key={trait.id.toString()}
                    onPress={() => {
                      setTraitId(trait.id.toString());
                    }}
                  >
                    {trait.name}
                  </SelectItem>
                );
              })}
            </Select>
            <Button
              size="sm"
              variant="ghost"
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
              size="sm"
              as="label"
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
              type="submit"
              color="primary"
              onPress={handleAdd}
              isLoading={isAdding}
              isDisabled={!user?.id || !name || !traitId}
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
