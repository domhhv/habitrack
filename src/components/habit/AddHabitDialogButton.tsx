import {
  Label,
  Modal,
  Select,
  ListBox,
  TextField,
  FieldError,
  InputGroup,
  useOverlayState,
} from '@heroui/react';
import { PlusIcon, CloudArrowUpIcon } from '@phosphor-icons/react';
import React from 'react';
import { href } from 'react-router';

import {
  ActionForm,
  CustomButton,
  AddTraitModal,
  VisuallyHiddenInput,
  MetricDefinitionForm,
} from '@components';
import { HABIT_FIELD_LIMITS } from '@const';
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
  const iconInputRef = React.useRef<HTMLInputElement | null>(null);
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
              <ActionForm
                fetcher={fetcher}
                className="contents"
                action={href('/habits')}
                encType="multipart/form-data"
              >
                <input type="hidden" name="intent" value="create-habit" />
                <input
                  type="hidden"
                  name="metricDefinitions"
                  value={JSON.stringify(metricDefinitions)}
                />
                <Modal.Body className="space-y-4">
                  <TextField
                    fullWidth
                    isRequired
                    name="name"
                    variant="secondary"
                  >
                    <Label>Name</Label>
                    <InputGroup>
                      <InputGroup.Input
                        value={name}
                        onChange={handleNameChange}
                        placeholder="Enter habit name"
                        maxLength={HABIT_FIELD_LIMITS.name}
                      />
                      <InputGroup.Suffix>
                        <span className="text-foreground-400 text-tiny whitespace-nowrap">
                          {name.length}/{HABIT_FIELD_LIMITS.name}
                        </span>
                      </InputGroup.Suffix>
                    </InputGroup>
                    <FieldError />
                  </TextField>
                  <TextField fullWidth name="description" variant="secondary">
                    <Label>Description</Label>
                    <InputGroup>
                      <InputGroup.Input
                        value={description}
                        onChange={handleDescriptionChange}
                        maxLength={HABIT_FIELD_LIMITS.description}
                        placeholder="Enter short description (optional)"
                      />
                      <InputGroup.Suffix>
                        <span className="text-foreground-400 text-tiny whitespace-nowrap">
                          {description.length}/{HABIT_FIELD_LIMITS.description}
                        </span>
                      </InputGroup.Suffix>
                    </InputGroup>
                    <FieldError />
                  </TextField>
                  <Select
                    name="traitId"
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
                  <CustomButton
                    fullWidth
                    size="sm"
                    variant="tertiary"
                    isDisabled={isAdding}
                    onPress={() => {
                      iconInputRef.current?.click();
                    }}
                  >
                    <CloudArrowUpIcon />
                    Upload habit icon
                  </CustomButton>
                  <VisuallyHiddenInput
                    name="icon"
                    ref={iconInputRef}
                    isDisabled={isAdding}
                    onChange={handleIconChange}
                  />
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
                    isPending={isAdding}
                    isDisabled={isAdding || !user?.id}
                  >
                    Submit
                  </CustomButton>
                </Modal.Footer>
              </ActionForm>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
};

export default AddHabitDialogButton;
