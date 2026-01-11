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
import { useUser, useTextField } from '@hooks';
import { useTraitActions } from '@stores';
import { makeTestOccurrence } from '@tests';
import { handleAsyncAction } from '@utils';

type AddCustomTraitModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AddTraitModal = ({ isOpen, onClose }: AddCustomTraitModalProps) => {
  const [color, setTraitColor] = React.useState('#94a3b8');
  const [isAdding, setIsAdding] = React.useState(false);

  const { user } = useUser();
  const { addTrait } = useTraitActions();
  const [label, handleLabelChange, clearLabel] = useTextField();
  const [description, handleDescriptionChange, clearDescription] =
    useTextField();

  const clearFields = React.useCallback(() => {
    clearLabel();
    clearDescription();
    setTraitColor('#94a3b8');
  }, [clearLabel, clearDescription]);

  React.useEffect(() => {
    if (!isOpen) {
      clearFields();
    }
  }, [isOpen, clearFields]);

  const handleAdd = async () => {
    if (!user) {
      return null;
    }

    void handleAsyncAction(
      addTrait({
        color,
        description,
        name: label,
        userId: user.id,
      }),
      'add_trait',
      setIsAdding
    )
      .then(onClose)
      .then(clearFields);
  };

  const handleTraitColorChange = (color: string) => {
    setTraitColor(color);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Add New Trait</ModalHeader>
        <ModalBody className="gap-4">
          <Input
            label="Name"
            value={label}
            variant="faded"
            isDisabled={isAdding}
            onChange={handleLabelChange}
            placeholder="e. g. Moderately Bad"
          />
          <Textarea
            variant="faded"
            value={description}
            label="Description"
            isDisabled={isAdding}
            onChange={handleDescriptionChange}
          />
          <div className="flex gap-2">
            <HexColorPicker color={color} onChange={handleTraitColorChange} />
            <div className="flex w-1/2 flex-col gap-2">
              <Input
                variant="faded"
                startContent="#"
                aria-label='"Color"'
                value={color.slice(1)}
                onChange={(event) => {
                  return handleTraitColorChange(event.target.value);
                }}
              />
              <p className="text-sm">
                This is how habits of this trait will appear on your calendar
              </p>
              <div className="flex">
                <OccurrenceChip
                  isClickable={false}
                  colorOverride={color}
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

export default AddTraitModal;
