import { OccurrenceChip } from '@components';
import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@heroui/react';
import { useTextField, useUser } from '@hooks';
import { useTraitActions } from '@stores';
import { makeTestOccurrence } from '@tests';
import { getErrorMessage, toEventLike } from '@utils';
import React from 'react';
import { HexColorPicker } from 'react-colorful';

export type AddCustomTraitModalProps = {
  open: boolean;
  onClose: () => void;
};

const AddCustomTraitModal = ({ open, onClose }: AddCustomTraitModalProps) => {
  const [label, handleLabelChange, clearTraitLabel] = useTextField();
  const [slug, handleSlugChange] = useTextField();
  const [description, handleDescriptionChange, clearDescription] =
    useTextField();
  const [color, setTraitColor] = React.useState('#94a3b8');
  const [isAdding, setIsAdding] = React.useState(false);
  const { addTrait } = useTraitActions();
  const { user } = useUser();

  React.useEffect(() => {
    handleSlugChange(toEventLike(label.toLowerCase().replace(/\s/g, '-')));
  }, [label, handleSlugChange]);

  const handleDialogClose = () => {
    clearTraitLabel();
    clearDescription();
    setTraitColor('#94a3b8');
    onClose();
  };

  const handleAdd = async () => {
    if (!user) {
      return null;
    }

    setIsAdding(true);

    try {
      await addTrait({
        name: label,
        description,
        slug,
        color,
        userId: user.id,
      });
    } catch (error) {
      console.error(error);
      addToast({
        title:
          'Something went wrong while adding your habit trait. Please try again.',
        description: `Error details: ${getErrorMessage(error)}`,
        color: 'danger',
      });
    } finally {
      setIsAdding(false);
    }

    handleDialogClose();
  };

  const handleTraitColorChange = (color: string) => {
    setTraitColor(color);
  };

  return (
    <Modal isOpen={open} onClose={handleDialogClose}>
      <ModalContent>
        <ModalHeader>Add Custom Trait</ModalHeader>
        <ModalBody className="gap-4">
          <p>
            You can define a custom trait for your habits (e g. Moderately Bad)
          </p>
          <Input
            variant="faded"
            value={label}
            onChange={handleLabelChange}
            isDisabled={isAdding}
            label="Trait Label"
          />
          <Input
            variant="faded"
            value={slug}
            onChange={handleSlugChange}
            isDisabled={isAdding}
            label="Trait Slug"
          />
          <Textarea
            variant="faded"
            value={description}
            onChange={handleDescriptionChange}
            isDisabled={isAdding}
            label="Trait Description"
          />
          <div className="flex gap-2">
            <HexColorPicker color={color} onChange={handleTraitColorChange} />
            <div className="flex w-1/2 flex-col gap-2">
              <Input
                variant="faded"
                value={color.slice(1)}
                onChange={(event) => {
                  return handleTraitColorChange(event.target.value);
                }}
                startContent="#"
              />
              <p className="text-sm">
                This is how habits of this trait will appear on your calendar
              </p>
              <div className="flex">
                <OccurrenceChip
                  isInteractable={false}
                  occurrences={[makeTestOccurrence()]}
                  colorOverride={color}
                />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            fullWidth
            color="primary"
            type="submit"
            isDisabled={isAdding || !user?.id}
            onPress={handleAdd}
          >
            Add Trait
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddCustomTraitModal;
