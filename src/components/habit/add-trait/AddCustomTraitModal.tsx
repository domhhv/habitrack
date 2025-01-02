import { OccurrenceChip } from '@components';
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
import { useTraitsStore } from '@stores';
import { useUser } from '@supabase/auth-helpers-react';
import { makeTestOccurrence } from '@tests';
import { toEventLike } from '@utils';
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
  const { addingTrait, addTrait } = useTraitsStore();
  const user = useUser();

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

    await addTrait({
      name: label,
      description,
      slug,
      color,
      userId: user.id,
    });

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
            variant="bordered"
            value={label}
            onChange={handleLabelChange}
            isDisabled={addingTrait}
            label="Trait Label"
          />
          <Input
            variant="bordered"
            value={slug}
            onChange={handleSlugChange}
            isDisabled={addingTrait}
            label="Trait Slug"
          />
          <Textarea
            variant="bordered"
            value={description}
            onChange={handleDescriptionChange}
            isDisabled={addingTrait}
            label="Trait Description"
          />
          <div className="flex gap-2">
            <HexColorPicker color={color} onChange={handleTraitColorChange} />
            <div className="flex w-1/2 flex-col gap-2">
              <Input
                variant="bordered"
                value={color.slice(1)}
                onChange={(event) => handleTraitColorChange(event.target.value)}
                startContent="#"
              />
              <p className="text-sm">
                This is how habits of this trait will appear on your calendar
              </p>
              <OccurrenceChip
                occurrences={[makeTestOccurrence()]}
                onDelete={() => null}
                colorOverride={color}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            fullWidth
            color="primary"
            type="submit"
            isDisabled={addingTrait || !user?.id}
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
