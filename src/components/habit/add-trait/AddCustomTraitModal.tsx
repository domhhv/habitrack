import { OccurrenceChip } from '@components';
import { useTraits } from '@context';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@nextui-org/react';
import { makeTestOccurrence } from '@tests';
import React from 'react';
import { HexColorPicker } from 'react-colorful';

export type AddCustomTraitModalProps = {
  open: boolean;
  onClose: () => void;
};

const AddCustomTraitModal = ({ open, onClose }: AddCustomTraitModalProps) => {
  const [traitLabel, setTraitLabel] = React.useState('');
  const [traitSlug, setTraitSlug] = React.useState('');
  const [traitDescription, setTraitDescription] = React.useState('');
  const [traitColor, setTraitColor] = React.useState('94a3b8');
  const { addingTrait, addTrait } = useTraits();

  React.useEffect(() => {
    setTraitSlug(traitLabel.toLowerCase().replace(/\s/g, '-') || '');
  }, [traitLabel]);

  const handleDialogClose = () => {
    setTraitLabel('');
    setTraitColor('');
    onClose();
  };

  const handleAdd = async () => {
    await addTrait({
      label: traitLabel,
      description: traitDescription,
      slug: traitSlug,
      color: traitColor,
      userId: null,
    });

    handleDialogClose();
  };

  const handleTraitLabelChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTraitLabel(event.target.value);
  };

  const handleTraitColorChange = (color: string) => {
    setTraitColor(color.slice(1));
  };

  const handleTraitDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTraitDescription(event.target.value);
  };

  const handleTraitSlugChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTraitSlug(event.target.value);
  };

  return (
    <Modal isOpen={open} onClose={handleDialogClose}>
      <ModalContent>
        <ModalHeader>Add Custom Trait</ModalHeader>
        <ModalBody className="gap-4">
          <p>
            You can define custom trait for your habits. For example,
            &quot;Neutral&quot; or &quot;Moderately Bad&quot;.
          </p>
          <Input
            value={traitLabel}
            onChange={handleTraitLabelChange}
            isDisabled={addingTrait}
            label="Trait Label"
          />
          <Input
            value={traitSlug}
            onChange={handleTraitSlugChange}
            isDisabled={addingTrait}
            label="Trait Slug"
          />
          <Textarea
            value={traitDescription}
            onChange={handleTraitDescriptionChange}
            isDisabled={addingTrait}
            label="Trait Description"
          />
          <div className="flex gap-2">
            <HexColorPicker
              color={traitColor}
              onChange={handleTraitColorChange}
            />
            <div className="flex w-1/2 flex-col gap-2">
              <Input
                value={traitColor}
                onChange={(event) => handleTraitColorChange(event.target.value)}
                startContent="#"
              />
              <p className="text-sm">
                This is how habits of this trait will appear on your calendar
              </p>
              <OccurrenceChip
                occurrence={makeTestOccurrence()}
                onDelete={() => null}
                colorOverride={`#${traitColor}`}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            fullWidth
            color="primary"
            type="submit"
            disabled={addingTrait}
            onClick={handleAdd}
          >
            Add Trait
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddCustomTraitModal;
