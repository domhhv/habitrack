import { AddCustomTraitModal, VisuallyHiddenInput } from '@components';
import { useTextField, useFileField } from '@hooks';
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
import { useHabitsStore, useTraitsStore } from '@stores';
import { useUser } from '@supabase/auth-helpers-react';
import React from 'react';

const AddHabitDialogButton = () => {
  const user = useUser();
  const { traits } = useTraitsStore();
  const { fetchingHabits, addingHabit, addHabit } = useHabitsStore();
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

    await addHabit(
      {
        name,
        description,
        userId: user.id,
        traitId: +traitId,
      },
      icon
    );

    handleDialogClose();
  };

  return (
    <>
      <div className="m-auto my-4 flex w-[95%] justify-end lg:w-[80%]">
        <Button
          color="primary"
          variant="solid"
          startContent={<Plus weight="bold" />}
          onClick={handleDialogOpen}
          isDisabled={fetchingHabits}
          data-testid="add-habit-button"
          className="w-full lg:w-auto"
        >
          Add habit
        </Button>
      </div>
      <AddCustomTraitModal
        open={addTraitModalOpen}
        onClose={() => setAddTraitModalOpen(false)}
      />
      <Modal
        isOpen={open}
        role="add-habit-dialog"
        onClose={handleDialogClose}
        isDismissable={false}
      >
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
              {traits.map((trait) => (
                <SelectItem
                  key={trait.id.toString()}
                  onClick={(e) => {
                    e.preventDefault();
                    setTraitId(trait.id.toString());
                  }}
                  textValue={trait.name}
                >
                  {trait.name}
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
              isDisabled={!user?.id}
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
