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
import { Plus, CloudArrowUp } from '@phosphor-icons/react';
import React from 'react';

import { AddTraitModal, VisuallyHiddenInput } from '@components';
import { handleAsyncAction } from '@helpers';
import { useUser, useTextField, useFileField } from '@hooks';
import { uploadHabitIcon } from '@services';
import { useTraits, useHabitActions } from '@stores';

type AddHabitDialogButtonProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AddHabitDialogButton = ({
  isOpen,
  onClose,
}: AddHabitDialogButtonProps) => {
  const traits = useTraits();
  const { user } = useUser();
  const { addHabit } = useHabitActions();
  const [name, handleNameChange] = useTextField();
  const [description, handleDescriptionChange] = useTextField();
  const [icon, handleIconChange] = useFileField();
  const [traitId, setTraitId] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);
  const [isTraitDialogAnimatingClose, setIsTraitDialogAnimatingClose] =
    React.useState<boolean>(false);
  const {
    isOpen: isTraitModalOpen,
    onClose: closeTraitModal,
    onOpen: openTraitModal,
  } = useDisclosure();

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

    void handleAsyncAction(add(), 'add_habit', setIsAdding).then(onClose);
  };

  return (
    <>
      {(isTraitModalOpen || isTraitDialogAnimatingClose) && (
        <AddTraitModal
          isOpen={isTraitModalOpen}
          onClose={() => {
            setIsTraitDialogAnimatingClose(true);
            closeTraitModal();
            setTimeout(() => {
              setIsTraitDialogAnimatingClose(false);
            }, 100);
          }}
        />
      )}
      <Modal isOpen={isOpen} onClose={onClose} role="add-habit-dialog">
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
              startContent={<Plus />}
              onPress={openTraitModal}
            >
              Or add a new trait
            </Button>
            <Button
              fullWidth
              size="sm"
              as="label"
              color="secondary"
              startContent={<CloudArrowUp />}
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
