import { Input, Button, Switch, NumberInput } from '@heroui/react';
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
      <Input
        autoFocus
        size="sm"
        label="Name"
        value={name}
        onValueChange={setName}
        placeholder="e.g. Velo Berry Frost 14mg"
      />
      <div className="flex gap-2">
        <NumberInput
          size="sm"
          label="Cost"
          minValue={0}
          value={cost}
          className="flex-1"
          placeholder="0.00"
          onValueChange={setCost}
          formatOptions={{
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          }}
        />
        <Input
          size="sm"
          label="Currency"
          value={currency}
          className="w-24"
          placeholder="EUR"
          onValueChange={setCurrency}
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          size="sm"
          isSelected={isQuantifiable}
          onValueChange={setIsQuantifiable}
        >
          Quantifiable
        </Switch>
        <span className="text-foreground-400 text-tiny">
          {isQuantifiable
            ? 'Exact item count (e.g. pouches in a can)'
            : 'Approximate usage (e.g. coffee beans)'}
        </span>
      </div>
      {isQuantifiable && (
        <NumberInput
          size="sm"
          minValue={1}
          value={totalItems}
          label="Total items"
          placeholder="e.g. 20"
          onValueChange={setTotalItems}
        />
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
          color="primary"
          isLoading={isSaving}
          onPress={handleSubmit}
          isDisabled={!name.trim()}
          startContent={!isSaving && <FloppyDiskIcon className="size-4" />}
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="light"
          onPress={onClose}
          isDisabled={isSaving}
          startContent={<XIcon className="size-4" />}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AddStockForm;
