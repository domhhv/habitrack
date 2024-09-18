import { OccurrenceChip } from '@components';
import { useTraits } from '@context';
import { useTextField } from '@hooks';
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
  const [label, handleLabelChange, clearTraitLabel] = useTextField();
  const [slug, handleSlugChange, , setTraitSlug] = useTextField();
  const [description, handleDescriptionChange] = useTextField();
  const [color, setTraitColor] = React.useState('94a3b8');
  const { addingTrait, addTrait } = useTraits();

  React.useEffect(() => {
    setTraitSlug(label.toLowerCase().replace(/\s/g, '-') || '');
  }, [label, setTraitSlug]);

  const handleDialogClose = () => {
    clearTraitLabel();
    setTraitColor('');
    onClose();
  };

  const handleAdd = async () => {
    await addTrait({
      name: label,
      description,
      slug,
      color,
      userId: null,
    });

    handleDialogClose();
  };

  const handleTraitColorChange = (color: string) => {
    setTraitColor(color.slice(1));
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
            value={label}
            onChange={handleLabelChange}
            isDisabled={addingTrait}
            label="Trait Label"
          />
          <Input
            value={slug}
            onChange={handleSlugChange}
            isDisabled={addingTrait}
            label="Trait Slug"
          />
          <Textarea
            value={description}
            onChange={handleDescriptionChange}
            isDisabled={addingTrait}
            label="Trait Description"
          />
          <div className="flex gap-2">
            <HexColorPicker color={color} onChange={handleTraitColorChange} />
            <div className="flex w-1/2 flex-col gap-2">
              <Input
                value={color}
                onChange={(event) => handleTraitColorChange(event.target.value)}
                startContent="#"
              />
              <p className="text-sm">
                This is how habits of this trait will appear on your calendar
              </p>
              <OccurrenceChip
                occurrence={makeTestOccurrence()}
                onDelete={() => null}
                colorOverride={`#${color}`}
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
