import {
  Input,
  Label,
  Switch,
  TextField,
  FieldError,
  NumberField,
} from '@heroui/react';
import { XIcon, FloppyDiskIcon } from '@phosphor-icons/react';
import React from 'react';
import { href } from 'react-router';

import { ActionForm, CustomButton } from '@components';
import { useProfile, useActionFetcher } from '@hooks';
import type {
  Habit,
  MetricValue,
  StockMetricDefaultsSubmission,
} from '@models';
import { pickDefinedValues } from '@utils';

import StockMetricDefaults from './StockMetricDefaults';

type AddStockFormProps = {
  habit: Habit;
  onClose: () => void;
};

const AddStockForm = ({ habit, onClose }: AddStockFormProps) => {
  const profile = useProfile();
  const fetcher = useActionFetcher(onClose);
  const isSaving = fetcher.state !== 'idle';

  const [name, setName] = React.useState('');
  const [cost, setCost] = React.useState<number | undefined>(undefined);
  const [currency, setCurrency] = React.useState(
    profile?.defaultCurrency || 'EUR'
  );
  const [totalItems, setTotalItems] = React.useState<number | undefined>(
    undefined
  );
  const [isQuantifiable, setIsQuantifiable] = React.useState(true);
  const [metricDefaults, setMetricDefaults] = React.useState<
    Record<string, MetricValue | undefined>
  >({});
  const [compoundDefaults, setCompoundDefaults] = React.useState<
    Record<string, boolean>
  >({});

  return (
    <ActionForm
      fetcher={fetcher}
      action={href('/habits/:habitId', { habitId: habit.id })}
      className="border-border flex flex-col gap-3 rounded-lg border p-4"
      onSubmit={(event) => {
        if (isSaving) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="intent" value="add-stock" />
      {habit.metricDefinitions.length > 0 && (
        <input
          type="hidden"
          name="metricDefaults"
          value={JSON.stringify({
            compound: compoundDefaults,
            values: pickDefinedValues(metricDefaults),
          } satisfies StockMetricDefaultsSubmission)}
        />
      )}
      <h3 className="text-sm font-medium">New stock item</h3>
      <TextField
        autoFocus
        isRequired
        name="name"
        value={name}
        onChange={setName}
      >
        <Label>Name</Label>
        <Input placeholder="e.g. Velo Berry Frost 14mg" />
        <FieldError />
      </TextField>
      <div className="flex gap-2">
        <NumberField
          name="cost"
          minValue={0}
          value={cost}
          className="flex-1"
          onChange={setCost}
          formatOptions={{
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          }}
        >
          <Label>Cost</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input placeholder="0.00" />
            <NumberField.IncrementButton />
          </NumberField.Group>
          <FieldError />
        </NumberField>
        <TextField
          isRequired
          name="currency"
          value={currency}
          className="w-24"
          onChange={setCurrency}
        >
          <Label>Currency</Label>
          <Input placeholder="EUR" />
          <FieldError />
        </TextField>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          size="sm"
          name="isQuantifiable"
          isSelected={isQuantifiable}
          onChange={setIsQuantifiable}
        >
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Content>
            <Label>Quantifiable</Label>
          </Switch.Content>
        </Switch>
        <span className="text-foreground-400 text-tiny">
          {isQuantifiable
            ? 'Exact item count (e.g. pouches in a can)'
            : 'Approximate usage (e.g. coffee beans)'}
        </span>
      </div>
      {isQuantifiable && (
        <NumberField
          isRequired
          minValue={1}
          name="totalItems"
          value={totalItems}
          onChange={setTotalItems}
        >
          <Label>Total items</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input placeholder="e.g. 20" />
            <NumberField.IncrementButton />
          </NumberField.Group>
          <FieldError />
        </NumberField>
      )}
      {habit.metricDefinitions.length > 0 && (
        <StockMetricDefaults
          onChange={setMetricDefaults}
          metricDefaults={metricDefaults}
          compoundDefaults={compoundDefaults}
          onCompoundChange={setCompoundDefaults}
          metricDefinitions={habit.metricDefinitions}
        />
      )}
      <div className="flex items-center gap-2">
        <CustomButton
          size="sm"
          type="submit"
          variant="primary"
          isPending={isSaving}
          isDisabled={isSaving}
        >
          <FloppyDiskIcon className="size-4" />
          Save
        </CustomButton>
        <CustomButton
          size="sm"
          variant="ghost"
          onPress={onClose}
          isDisabled={isSaving}
        >
          <XIcon className="size-4" />
          Cancel
        </CustomButton>
      </div>
    </ActionForm>
  );
};

export default AddStockForm;
