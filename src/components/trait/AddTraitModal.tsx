import { Input, Label, Modal, TextField, FieldError } from '@heroui/react';
import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { href } from 'react-router';

import { ActionForm, CustomButton, OccurrenceChip } from '@components';
import { useUser, useTextField, useActionFetcher } from '@hooks';
import { makeTestOccurrence } from '@tests';

type AddCustomTraitModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DEFAULT_TRAIT_COLOR = '#94a3b8';

const AddTraitModal = ({ isOpen, onClose }: AddCustomTraitModalProps) => {
  const [color, setTraitColor] = React.useState(DEFAULT_TRAIT_COLOR);

  const user = useUser();
  const [label, handleLabelChange, clearLabel] = useTextField();
  const [description, handleDescriptionChange, clearDescription] =
    useTextField();

  const clearFields = React.useCallback(() => {
    clearLabel();
    clearDescription();
    setTraitColor(DEFAULT_TRAIT_COLOR);
  }, [clearLabel, clearDescription]);

  const fetcher = useActionFetcher(() => {
    onClose();
    clearFields();
  });
  const isAdding = fetcher.state !== 'idle';

  React.useEffect(() => {
    if (!isOpen) {
      clearFields();
    }
  }, [isOpen, clearFields]);

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
            <ActionForm
              fetcher={fetcher}
              className="contents"
              action={href('/habits')}
            >
              <input type="hidden" name="intent" value="create-trait" />
              <Modal.Body className="space-y-4">
                <TextField
                  fullWidth
                  name="name"
                  value={label}
                  variant="secondary"
                  isDisabled={isAdding}
                  onChange={handleLabelChange}
                >
                  <Label>Label</Label>
                  <Input
                    variant="secondary"
                    placeholder="e. g. Moderately Bad"
                  />
                  <FieldError />
                </TextField>
                <TextField
                  fullWidth
                  name="description"
                  variant="secondary"
                  value={description}
                  isDisabled={isAdding}
                  onChange={handleDescriptionChange}
                >
                  <Label>Description</Label>
                  <Input variant="secondary" placeholder="Optional" />
                </TextField>
                <div className="flex gap-4">
                  <HexColorPicker color={color} onChange={setTraitColor} />
                  <div className="flex w-1/2 flex-col gap-2">
                    <TextField
                      name="color"
                      aria-label="Color"
                      variant="secondary"
                      isDisabled={isAdding}
                      value={color.slice(1)}
                      onChange={(value) => {
                        setTraitColor(`#${value.replace(/^#/, '')}`);
                      }}
                    >
                      <div className="relative flex items-center">
                        <span className="pointer-events-none absolute left-2 text-sm">
                          #
                        </span>
                        <Input className="pl-5" variant="secondary" />
                      </div>
                      <FieldError />
                    </TextField>
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
                <CustomButton
                  fullWidth
                  type="submit"
                  variant="primary"
                  isPending={isAdding}
                  isDisabled={isAdding || !user?.id}
                >
                  Add Trait
                </CustomButton>
              </Modal.Footer>
            </ActionForm>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default AddTraitModal;
