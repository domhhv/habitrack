import {
  Input,
  Label,
  Button,
  Switch,
  TextField,
  NumberField,
} from '@heroui/react';
import { XIcon, FloppyDiskIcon } from '@phosphor-icons/react';
import React from 'react';

import type {
  Habit,
  MetricValue,
  HabitStockMetricDefaultInsert,
} from '@models';
import { useUser, useProfile, useStockActions } from '@stores';
import { handleAsyncAction } from '@utils';

import StockMetricDefaults from './StockMetricDefaults';

type AddStockFormProps = {
  habit: Habit;
  onClose: () => void;
};

const AddStockForm = ({ habit, onClose }: AddStockFormProps) => {
  const user = useUser();
  const profile = useProfile();
  const { addStock } = useStockActions();

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
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSubmit = async () => {
    if (!user || !name.trim()) {
      return;
    }

    if (isQuantifiable && (!totalItems || totalItems <= 0)) {
      return;
    }

    const stockInsert = {
      cost: cost ?? null,
      currency,
      habitId: habit.id,
      isDepleted: false,
      name: name.trim(),
      remainingItems: isQuantifiable && totalItems ? totalItems : null,
      totalItems: isQuantifiable && totalItems ? totalItems : null,
      userId: user.id,
    };

    const metricDefaultInserts: HabitStockMetricDefaultInsert[] =
      Object.entries(metricDefaults)
        .filter(([, val]) => {
          return val !== undefined;
        })
        .map(([metricId, val]) => {
          return {
            habitMetricId: metricId,
            habitStockId: '',
            shouldCompound: compoundDefaults[metricId] ?? false,
            userId: user.id,
            value: val as MetricValue,
          };
        });

    await handleAsyncAction(
      addStock(stockInsert, metricDefaultInserts),
      'add_stock',
      setIsSaving
    );

    onClose();
  };

  return (
    <div className="border-content3 flex flex-col gap-3 rounded-lg border p-4">
      <h3 className="text-sm font-medium">New stock item</h3>
      <TextField autoFocus value={name} onChange={setName}>
        <Label>Name</Label>
        <Input placeholder="e.g. Velo Berry Frost 14mg" />
      </TextField>
      <div className="flex gap-2">
        <NumberField
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
        </NumberField>
        <TextField value={currency} className="w-24" onChange={setCurrency}>
          <Label>Currency</Label>
          <Input placeholder="EUR" />
        </TextField>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          size="sm"
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
        <NumberField minValue={1} value={totalItems} onChange={setTotalItems}>
          <Label>Total items</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input placeholder="e.g. 20" />
            <NumberField.IncrementButton />
          </NumberField.Group>
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
        <Button
          size="sm"
          variant="primary"
          onPress={handleSubmit}
          isDisabled={
            isSaving || !name.trim() || (isQuantifiable && !totalItems)
          }
        >
          <FloppyDiskIcon className="size-4" />
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onPress={onClose}
          isDisabled={isSaving}
        >
          <XIcon className="size-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AddStockForm;
