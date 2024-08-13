import {
  FloatingLabelInput,
  FloatingLabelTextarea,
  OccurrenceChip,
} from '@components';
import { useTraits } from '@context';
import {
  Button,
  DialogContent,
  DialogActions,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Box,
  Typography,
  Input,
} from '@mui/joy';
import { makeTestOccurrence } from '@tests';
import React, { type FormEventHandler } from 'react';
import { HexColorPicker } from 'react-colorful';

import { StyledColorPickerContainerDiv } from './styled';

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

  const handleAdd: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
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
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setTraitDescription(event.target.value);
  };

  const handleTraitSlugChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTraitSlug(event.target.value);
  };

  return (
    <Modal open={open} onClose={handleDialogClose}>
      <ModalDialog sx={{ width: 400 }}>
        <ModalClose onClick={handleDialogClose} />
        <DialogTitle>Add Custom Trait</DialogTitle>
        <DialogContent>
          <form onSubmit={handleAdd}>
            <Typography gutterBottom>
              You can define custom trait for your habits. For example,
              &quot;Neutral&quot; or &quot;Moderately Bad&quot;.
            </Typography>
            <Box mb={2}>
              <FloatingLabelInput
                value={traitLabel}
                onChange={handleTraitLabelChange}
                disabled={addingTrait}
                label="Trait Label"
              />
            </Box>
            <Box mb={2}>
              <FloatingLabelInput
                value={traitSlug}
                onChange={handleTraitSlugChange}
                disabled={addingTrait}
                label="Trait Slug"
              />
            </Box>
            <Box mb={2}>
              <FloatingLabelTextarea
                value={traitDescription}
                onChange={handleTraitDescriptionChange}
                disabled={addingTrait}
                label="Trait Description"
              />
            </Box>
            <StyledColorPickerContainerDiv>
              <HexColorPicker
                color={traitColor}
                onChange={handleTraitColorChange}
              />
              <div>
                <Input
                  value={traitColor}
                  onChange={(event) =>
                    handleTraitColorChange(event.target.value)
                  }
                  startDecorator="#"
                />
                <Typography level="body-sm">
                  This is how habits of this trait will appear on your calendar
                </Typography>
                <OccurrenceChip
                  occurrence={makeTestOccurrence()}
                  onDelete={() => null}
                  colorOverride={`#${traitColor}`}
                />
              </div>
            </StyledColorPickerContainerDiv>
            <DialogActions>
              <Button type="submit" disabled={addingTrait}>
                Add Trait
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default AddCustomTraitModal;
