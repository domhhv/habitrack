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
  useDisclosure,
} from '@heroui/react';
import { PlusIcon, CloudArrowUpIcon } from '@phosphor-icons/react';
import React from 'react';

import { AddTraitModal, VisuallyHiddenInput } from '@components';
import { useUser, useTextField, useFileField } from '@hooks';
import { uploadHabitIcon } from '@services';
import { useTraits, useHabitActions } from '@stores';
import { handleAsyncAction } from '@utils';

const AddHabitDialogButton = () => {
  const [traitId, setTraitId] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);

  const traits = useTraits();
  const { user } = useUser();
  const { addHabit } = useHabitActions();
  const [icon, handleIconChange, clearIcon] = useFileField();
  const [name, handleNameChange, clearName] = useTextField();
  const [description, handleDescriptionChange, clearDescription] =
    useTextField();

  const {
    isOpen: isAddDialogOpen,
    onClose: closeAddDialog,
    onOpen: openAddDialog,
  } = useDisclosure();
  const {
    isOpen: isTraitModalOpen,
    onClose: closeTraitModal,
    onOpen: openTraitModal,
  } = useDisclosure();

  const clearFields = React.useCallback(() => {
    clearName();
    clearDescription();
    clearIcon();
    setTraitId('');
  }, [clearName, clearDescription, clearIcon]);

  React.useEffect(() => {
    if (!isAddDialogOpen) {
      clearFields();
    }
  }, [isAddDialogOpen, clearFields]);

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
        traitId,
        userId: user.id,
      });
    };

    void handleAsyncAction(add(), 'add_habit', setIsAdding)
      .then(closeAddDialog)
      .then(clearFields);
  };

  return (
    <>
      <AddTraitModal isOpen={isTraitModalOpen} onClose={closeTraitModal} />

      <Button
        color="primary"
        variant="solid"
        onPress={openAddDialog}
        className="w-full lg:w-auto"
        data-testid="add-habit-button"
        startContent={<PlusIcon weight="bold" />}
      >
        Add habit
      </Button>

      <Modal
        role="add-habit-dialog"
        isOpen={isAddDialogOpen}
        onClose={closeAddDialog}
      >
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
              {Object.values(traits).map((trait) => {
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
              onPress={openTraitModal}
              startContent={<PlusIcon />}
            >
              Or add a new trait
            </Button>
            <Button
              fullWidth
              size="sm"
              as="label"
              color="secondary"
              startContent={<CloudArrowUpIcon />}
            >
              Upload habit icon
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
