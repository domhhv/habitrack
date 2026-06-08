import { Input, Modal, Button, TextArea } from '@heroui/react';
import React from 'react';
import { HexColorPicker } from 'react-colorful';

import { OccurrenceChip } from '@components';
import { useTextField } from '@hooks';
import { useUser, useTraitActions } from '@stores';
import { makeTestOccurrence } from '@tests';
import { handleAsyncAction } from '@utils';

type AddCustomTraitModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AddTraitModal = ({ isOpen, onClose }: AddCustomTraitModalProps) => {
  const [color, setTraitColor] = React.useState('#94a3b8');
  const [isAdding, setIsAdding] = React.useState(false);

  const user = useUser();
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
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Add New Trait</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="gap-4">
              <Input
                value={label}
                variant="secondary"
                disabled={isAdding}
                onChange={handleLabelChange}
                placeholder="e. g. Moderately Bad"
              />
              <TextArea
                variant="secondary"
                value={description}
                disabled={isAdding}
                onChange={(e) => {
                  handleDescriptionChange(e.target.value);
                }}
              />
              <div className="flex gap-2">
                <HexColorPicker
                  color={color}
                  onChange={handleTraitColorChange}
                />
                <div className="flex w-1/2 flex-col gap-2">
                  <div className="relative flex items-center">
                    <span className="pointer-events-none absolute left-2 text-sm">
                      #
                    </span>
                    <Input
                      className="pl-5"
                      aria-label="Color"
                      variant="secondary"
                      value={color.slice(1)}
                      onChange={(event) => {
                        handleTraitColorChange(event.target.value);
                      }}
                    />
                  </div>
                  <p className="text-sm">
                    This is how habits of this trait will appear on your
                    calendar
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
            </Modal.Body>
            <Modal.Footer>
              <Button
                fullWidth
                type="submit"
                variant="primary"
                onPress={handleAdd}
                isDisabled={isAdding || !user?.id}
              >
                Add Trait
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default AddTraitModal;
