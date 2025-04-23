import {
  Input,
  Modal,
  Button,
  Textarea,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalContent,
} from '@heroui/react';
import React from 'react';
import { HexColorPicker } from 'react-colorful';

import { OccurrenceChip } from '@components';
import { handleAsyncAction } from '@helpers';
import { useUser, useTextField } from '@hooks';
import { useTraitActions } from '@stores';
import { makeTestOccurrence } from '@tests';
import { toEventLike } from '@utils';

type AddCustomTraitModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AddCustomTraitModal = ({ isOpen, onClose }: AddCustomTraitModalProps) => {
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

    void handleAsyncAction(
      addTrait({
        color,
        description,
        name: label,
        slug,
        userId: user.id,
      }),
      'add_trait',
      setIsAdding
    ).then(handleDialogClose);
  };

  const handleTraitColorChange = (color: string) => {
    setTraitColor(color);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleDialogClose}>
      <ModalContent>
        <ModalHeader>Add Custom Trait</ModalHeader>
        <ModalBody className="gap-4">
          <p>
            You can define a custom trait for your habits (e g. Moderately Bad)
          </p>
          <Input
            value={label}
            variant="faded"
            label="Trait Label"
            isDisabled={isAdding}
            onChange={handleLabelChange}
          />
          <Input
            value={slug}
            variant="faded"
            label="Trait Slug"
            isDisabled={isAdding}
            onChange={handleSlugChange}
          />
          <Textarea
            variant="faded"
            value={description}
            isDisabled={isAdding}
            label="Trait Description"
            onChange={handleDescriptionChange}
          />
          <div className="flex gap-2">
            <HexColorPicker color={color} onChange={handleTraitColorChange} />
            <div className="flex w-1/2 flex-col gap-2">
              <Input
                variant="faded"
                startContent="#"
                value={color.slice(1)}
                aria-label='"Trait Color"'
                onChange={(event) => {
                  return handleTraitColorChange(event.target.value);
                }}
              />
              <p className="text-sm">
                This is how habits of this trait will appear on your calendar
              </p>
              <div className="flex">
                <OccurrenceChip
                  colorOverride={color}
                  isInteractable={false}
                  occurrences={[makeTestOccurrence()]}
                />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            fullWidth
            type="submit"
            color="primary"
            onPress={handleAdd}
            isDisabled={isAdding || !user?.id}
          >
            Add Trait
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddCustomTraitModal;
