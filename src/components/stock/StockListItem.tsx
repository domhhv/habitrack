import {
  Chip,
  Input,
  Label,
  Button,
  Switch,
  TextField,
  NumberField,
} from '@heroui/react';
import {
  XIcon,
  TrashIcon,
  FloppyDiskIcon,
  CheckCircleIcon,
  PencilSimpleIcon,
} from '@phosphor-icons/react';
import React from 'react';

import type { Habit, MetricValue, HabitStockWithDefaults } from '@models';
import { useUser, useStockActions, useConfirmationActions } from '@stores';
import { handleAsyncAction } from '@utils';

import StockMetricDefaults from './StockMetricDefaults';

type StockListItemProps = {
  metricDefinitions: Habit['metricDefinitions'];
  stock: HabitStockWithDefaults;
};

const formatCost = (cost: number | null, currency: string) => {
  if (cost === null) {
    return null;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      currency,
      style: 'currency',
    }).format(cost);
  } catch {
    return `${cost} ${currency}`;
  }
};

const StockListItem = ({ metricDefinitions, stock }: StockListItemProps) => {
  const { removeStock, updateStock, updateStockMetricDefaults } =
    useStockActions();
  const { askConfirmation } = useConfirmationActions();
  const user = useUser();
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(stock.name);
  const [cost, setCost] = React.useState<number | undefined>(
    stock.cost ?? undefined
  );
  const [currency, setCurrency] = React.useState(stock.currency);
  const [totalItems, setTotalItems] = React.useState<number | undefined>(
    stock.totalItems ?? undefined
  );
  const [remainingItems, setRemainingItems] = React.useState<
    number | undefined
  >(stock.remainingItems ?? undefined);
  const [isQuantifiable, setIsQuantifiable] = React.useState(
    stock.totalItems !== null
  );
  const [metricDefaults, setMetricDefaults] = React.useState<
    Record<string, MetricValue | undefined>
  >({});
  const [compoundDefaults, setCompoundDefaults] = React.useState<
    Record<string, boolean>
  >({});
  const [isSaving, setIsSaving] = React.useState(false);

  const costPerItem =
    stock.cost !== null && stock.totalItems !== null
      ? stock.cost / stock.totalItems
      : null;

  const avgCostPerOccurrence =
    stock.isDepleted && stock.cost !== null && stock.usageCount > 0
      ? stock.cost / stock.usageCount
      : null;

  const handleDelete = async () => {
    if (
      await askConfirmation({
        confirmText: 'Delete',
        description: 'Are you sure you want to delete this stock?',
        title: 'Delete stock',
        variant: 'danger',
      })
    ) {
      void handleAsyncAction(
        removeStock(stock.id, stock.habitId),
        'remove_stock'
      );
    }
  };

  const handleToggleDepleted = () => {
    void handleAsyncAction(
      updateStock(stock.id, { isDepleted: !stock.isDepleted }, stock.habitId),
      'update_stock'
    );
  };

  const startEditing = () => {
    setName(stock.name);
    setCost(stock.cost ?? undefined);
    setCurrency(stock.currency);
    setTotalItems(stock.totalItems ?? undefined);
    setRemainingItems(stock.remainingItems ?? undefined);
    setIsQuantifiable(stock.totalItems !== null);
    const defaults: Record<string, MetricValue | undefined> = {};
    const compoundMap: Record<string, boolean> = {};

    for (const metricDefault of stock.metricDefaults) {
      defaults[metricDefault.habitMetricId] =
        metricDefault.value as MetricValue;
      compoundMap[metricDefault.habitMetricId] =
        metricDefault.shouldCompound ?? false;
    }

    setMetricDefaults(defaults);
    setCompoundDefaults(compoundMap);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName || !user) {
      return;
    }

    if (isQuantifiable && totalItems == null) {
      return;
    }

    const nextTotalItems = isQuantifiable ? (totalItems ?? null) : null;
    const nextRemainingItems =
      isQuantifiable && nextTotalItems !== null
        ? Math.min(remainingItems ?? nextTotalItems, nextTotalItems)
        : null;

    await handleAsyncAction(
      (async () => {
        await updateStock(
          stock.id,
          {
            cost: cost ?? null,
            currency,
            name: trimmedName,
            remainingItems: nextRemainingItems,
            totalItems: nextTotalItems,
          },
          stock.habitId
        );

        if (metricDefinitions.length > 0) {
          await updateStockMetricDefaults(
            stock.habitId,
            stock.id,
            metricDefaults,
            compoundDefaults,
            user.id
          );
        }
      })(),
      'update_stock',
      setIsSaving
    );

    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(stock.name);
    setCost(stock.cost ?? undefined);
    setCurrency(stock.currency);
    setTotalItems(stock.totalItems ?? undefined);
    setRemainingItems(stock.remainingItems ?? undefined);
    setIsQuantifiable(stock.totalItems !== null);
    const defaults: Record<string, MetricValue | undefined> = {};
    const compoundMap: Record<string, boolean> = {};

    for (const metricDefault of stock.metricDefaults) {
      defaults[metricDefault.habitMetricId] =
        metricDefault.value as MetricValue;
      compoundMap[metricDefault.habitMetricId] =
        metricDefault.shouldCompound ?? false;
    }

    setMetricDefaults(defaults);
    setCompoundDefaults(compoundMap);
    setIsEditing(false);
  };

  return (
    <div className="border-content3 flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{stock.name}</span>
            {stock.isDepleted && (
              <Chip size="sm" color="default" variant="tertiary">
                Depleted
              </Chip>
            )}
          </div>
          <div className="text-foreground-400 text-tiny mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            {stock.cost !== null && (
              <span>{formatCost(stock.cost, stock.currency)}</span>
            )}
            {stock.totalItems !== null && (
              <span>
                {stock.remainingItems ?? 0}/{stock.totalItems} remaining
              </span>
            )}
            {stock.totalItems === null && <span>Semi-quantifiable</span>}
            {costPerItem !== null && (
              <span>{formatCost(costPerItem, stock.currency)}/item</span>
            )}
            {avgCostPerOccurrence !== null && (
              <span>
                Avg {formatCost(avgCostPerOccurrence, stock.currency)}
                /occurrence
              </span>
            )}
          </div>
          {stock.metricDefaults.length > 0 && (
            <div className="text-foreground-400 text-tiny mt-1">
              {stock.metricDefaults.length} metric default
              {stock.metricDefaults.length !== 1 && 's'}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            isIconOnly
            variant="ghost"
            onPress={handleToggleDepleted}
            isDisabled={isEditing || isSaving}
            aria-label={
              stock.isDepleted ? 'Mark as active' : 'Mark as depleted'
            }
          >
            <CheckCircleIcon
              className="size-4"
              weight={stock.isDepleted ? 'fill' : 'regular'}
            />
          </Button>
          <Button
            size="sm"
            isIconOnly
            variant="ghost"
            onPress={startEditing}
            aria-label="Edit stock"
            isDisabled={isEditing || isSaving}
          >
            <PencilSimpleIcon className="size-4" />
          </Button>
          <Button
            size="sm"
            isIconOnly
            variant="ghost"
            onPress={handleDelete}
            className="text-danger"
            aria-label="Delete stock"
            isDisabled={isEditing || isSaving}
          >
            <TrashIcon className="size-4" />
          </Button>
        </div>
      </div>
      {isEditing && (
        <div className="flex flex-col gap-3">
          <TextField value={name} onChange={setName}>
            <Label>Name</Label>
            <Input placeholder="Stock name" />
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
              {isQuantifiable ? 'Exact item count' : 'Approximate usage'}
            </span>
          </div>
          {isQuantifiable && (
            <div className="flex gap-2">
              <NumberField
                minValue={1}
                value={totalItems}
                className="flex-1"
                onChange={setTotalItems}
              >
                <Label>Total items</Label>
                <NumberField.Group>
                  <NumberField.DecrementButton />
                  <NumberField.Input placeholder="e.g. 20" />
                  <NumberField.IncrementButton />
                </NumberField.Group>
              </NumberField>
              <NumberField
                minValue={0}
                className="flex-1"
                value={remainingItems}
                isDisabled={!totalItems}
                onChange={setRemainingItems}
                maxValue={totalItems ?? undefined}
              >
                <Label>Remaining</Label>
                <NumberField.Group>
                  <NumberField.DecrementButton />
                  <NumberField.Input placeholder="e.g. 10" />
                  <NumberField.IncrementButton />
                </NumberField.Group>
              </NumberField>
            </div>
          )}
          {isQuantifiable && totalItems !== undefined && (
            <Button
              size="sm"
              variant="ghost"
              onPress={() => {
                return setRemainingItems(totalItems);
              }}
            >
              Reset remaining to total
            </Button>
          )}
          {metricDefinitions.length > 0 && (
            <StockMetricDefaults
              onChange={setMetricDefaults}
              metricDefaults={metricDefaults}
              compoundDefaults={compoundDefaults}
              metricDefinitions={metricDefinitions}
              onCompoundChange={setCompoundDefaults}
            />
          )}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              onPress={handleSave}
              isDisabled={isSaving || !name.trim() || !user}
            >
              <FloppyDiskIcon className="size-4" />
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              isDisabled={isSaving}
              onPress={handleCancel}
            >
              <XIcon className="size-4" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockListItem;
