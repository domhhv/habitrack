import {
  Label,
  Modal,
  Select,
  ListBox,
  TextField,
  InputGroup,
  useOverlayState,
} from '@heroui/react';
import { PlusIcon, CloudArrowUpIcon } from '@phosphor-icons/react';
import React from 'react';

import {
  CustomButton,
  AddTraitModal,
  VisuallyHiddenInput,
  MetricDefinitionForm,
} from '@components';
import {
  useUser,
  useTraits,
  useTextField,
  useFileField,
  useActionFetcher,
} from '@hooks';
import type { FormMetricDefinitions } from '@models';

const AddHabitDialogButton = () => {
  const [traitId, setTraitId] = React.useState('');
  const [metricDefinitions, setMetricDefinitions] = React.useState<
    FormMetricDefinitions[]
  >([]);

  const traits = useTraits();
  const user = useUser();
  const [icon, handleIconChange, clearIcon] = useFileField();
  const [name, handleNameChange, clearName] = useTextField();
  const [description, handleDescriptionChange, clearDescription] =
    useTextField();

  const addDialogState = useOverlayState();
  const traitModalState = useOverlayState();

  const clearFields = React.useCallback(() => {
    clearName();
    clearDescription();
    clearIcon();
    setTraitId('');
    setMetricDefinitions([]);
  }, [clearName, clearDescription, clearIcon]);

  const fetcher = useActionFetcher(() => {
    addDialogState.close();
    clearFields();
  });
  const isAdding = fetcher.state !== 'idle';

  React.useEffect(() => {
    if (!addDialogState.isOpen) {
      clearFields();
    }
  }, [addDialogState.isOpen, clearFields]);

  const handleAdd = () => {
    const formData = new FormData();

    formData.set('name', name);
    formData.set('description', description);
    formData.set('traitId', traitId);
    formData.set('metricDefinitions', JSON.stringify(metricDefinitions));

    if (icon) {
      formData.set('icon', icon);
    }

    void fetcher.submit(formData, {
      action: '/habits',
      encType: 'multipart/form-data',
      method: 'post',
    });
  };

  const addMetric = () => {
    setMetricDefinitions((prev) => {
      return [
        ...prev,
        {
          config: {},
          id: `form-${Date.now()}`,
          isBeingEdited: true,
          isRequired: false,
          name: 'Unnamed metric',
          presetName: '',
          sortOrder: prev.length,
          type: 'number',
        },
      ];
    });
  };

  return (
    <>
      <AddTraitModal
        isOpen={traitModalState.isOpen}
        onClose={traitModalState.close}
      />

      <CustomButton
        variant="primary"
        onPress={addDialogState.open}
        data-testid="add-habit-button"
      >
        <PlusIcon weight="bold" />
        Add habit
      </CustomButton>

      <Modal state={addDialogState}>
        <Modal.Backdrop>
          <Modal.Container size="lg" scroll="outside">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Add New Habit</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="space-y-4">
                <TextField fullWidth name="name" variant="secondary">
                  <Label>Name</Label>
                  <InputGroup>
                    <InputGroup.Input
                      required
                      value={name}
                      maxLength={50}
                      onChange={handleNameChange}
                      placeholder="Enter habit name"
                    />
                    <InputGroup.Suffix>
                      <span className="text-foreground-400 text-tiny whitespace-nowrap">
                        {name.length}/50
                      </span>
                    </InputGroup.Suffix>
                  </InputGroup>
                </TextField>
                <TextField fullWidth name="description" variant="secondary">
                  <Label>Description</Label>
                  <InputGroup>
                    <InputGroup.Input
                      maxLength={100}
                      value={description}
                      onChange={handleDescriptionChange}
                      placeholder="Enter short description (optional)"
                    />
                    <InputGroup.Suffix>
                      <span className="text-foreground-400 text-tiny whitespace-nowrap">
                        {description.length}/100
                      </span>
                    </InputGroup.Suffix>
                  </InputGroup>
                </TextField>
                <Select
                  variant="secondary"
                  value={traitId || null}
                  placeholder="Choose a trait (optional)"
                  onChange={(key) => {
                    setTraitId(typeof key === 'string' ? key : '');
                  }}
                >
                  <Label>Choose a trait</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {Object.values(traits).map((trait) => {
                        return (
                          <ListBox.Item
                            textValue={trait.name}
                            id={trait.id.toString()}
                            key={trait.id.toString()}
                          >
                            {trait.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        );
                      })}
                    </ListBox>
                  </Select.Popover>
                </Select>
                <CustomButton
                  fullWidth
                  size="sm"
                  variant="tertiary"
                  className="min-h-8"
                  onPress={traitModalState.open}
                >
                  <PlusIcon />
                  Or add a new trait
                </CustomButton>
                <CustomButton fullWidth size="sm" variant="tertiary">
                  <CloudArrowUpIcon />
                  Upload habit icon
                </CustomButton>
                <VisuallyHiddenInput onChange={handleIconChange} />
                {icon && <p>{icon.name}</p>}

                {metricDefinitions.map((md) => {
                  return (
                    <MetricDefinitionForm
                      key={md.id}
                      metric={md}
                      onRemove={() => {
                        setMetricDefinitions((prev) => {
                          return prev.filter((prevMd) => {
                            return prevMd.id !== md.id;
                          });
                        });
                      }}
                      onChange={(metricUpdates) => {
                        setMetricDefinitions((prev) => {
                          return prev.map((prevMd) => {
                            if (prevMd.id === md.id) {
                              return {
                                ...prevMd,
                                ...metricUpdates,
                              };
                            }

                            return prevMd;
                          });
                        });
                      }}
                    />
                  );
                })}
                <CustomButton
                  fullWidth
                  size="sm"
                  variant="tertiary"
                  className="min-h-8"
                  onPress={addMetric}
                  isDisabled={isAdding}
                >
                  Add metric
                </CustomButton>
              </Modal.Body>
              <Modal.Footer>
                <CustomButton
                  fullWidth
                  type="submit"
                  variant="primary"
                  onPress={handleAdd}
                  isPending={isAdding}
                  isDisabled={isAdding || !user?.id || !name}
                >
                  Submit
                </CustomButton>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
};

export default AddHabitDialogButton;
