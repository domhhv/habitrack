import {
  Chip,
  Input,
  Label,
  Switch,
  TextField,
  FieldError,
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
import { href } from 'react-router';

import { ActionForm, CustomButton } from '@components';
import { useActionFetcher } from '@hooks';
import type {
  Habit,
  MetricValue,
  HabitStockWithDefaults,
  StockMetricDefaultsSubmission,
} from '@models';
import { useConfirmationActions } from '@stores';
import { pickDefinedValues } from '@utils';

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
  const { askConfirmation } = useConfirmationActions();
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
  const fetcher = useActionFetcher(() => {
    setIsEditing(false);
  });
  const isSaving = fetcher.state !== 'idle';

  const habitAction = href('/habits/:habitId', { habitId: stock.habitId });

  const submitStockChange = (fields: Record<string, string>) => {
    void fetcher.submit(
      { ...fields, stockId: stock.id },
      { action: habitAction, method: 'post' }
    );
  };

  const costPerItem =
    stock.cost !== null && stock.totalItems !== null
      ? stock.cost / stock.totalItems
      : null;

  const avgCostPerOccurrence =
    stock.isDepleted &&
    stock.cost !== null &&
    stock.usageCount > 0 &&
    stock.totalItems === null
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
      submitStockChange({ intent: 'remove-stock' });
    }
  };

  const handleToggleDepleted = () => {
    submitStockChange({
      intent: 'set-stock-depleted',
      isDepleted: String(!stock.isDepleted),
    });
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
      defaults[metricDefault.habitMetricId] = metricDefault.value;
      compoundMap[metricDefault.habitMetricId] =
        metricDefault.shouldCompound ?? false;
    }

    setMetricDefaults(defaults);
    setCompoundDefaults(compoundMap);
    setIsEditing(true);
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
      defaults[metricDefault.habitMetricId] = metricDefault.value;
      compoundMap[metricDefault.habitMetricId] =
        metricDefault.shouldCompound ?? false;
    }

    setMetricDefaults(defaults);
    setCompoundDefaults(compoundMap);
    setIsEditing(false);
  };

  return (
    <div className="border-border flex flex-col gap-3 rounded-lg border p-3">
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
          <CustomButton
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
          </CustomButton>
          <CustomButton
            size="sm"
            isIconOnly
            variant="ghost"
            onPress={startEditing}
            aria-label="Edit stock"
            isDisabled={isEditing || isSaving}
          >
            <PencilSimpleIcon className="size-4" />
          </CustomButton>
          <CustomButton
            size="sm"
            isIconOnly
            variant="ghost"
            onPress={handleDelete}
            className="text-danger"
            aria-label="Delete stock"
            isDisabled={isEditing || isSaving}
          >
            <TrashIcon className="size-4" />
          </CustomButton>
        </div>
      </div>
      {isEditing && (
        <ActionForm
          fetcher={fetcher}
          action={habitAction}
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            if (isSaving) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="intent" value="update-stock" />
          <input type="hidden" name="stockId" value={stock.id} />
          {metricDefinitions.length > 0 && (
            <input
              type="hidden"
              name="metricDefaults"
              value={JSON.stringify({
                compound: compoundDefaults,
                values: pickDefinedValues(metricDefaults),
              } satisfies StockMetricDefaultsSubmission)}
            />
          )}
          <TextField isRequired name="name" value={name} onChange={setName}>
            <Label>Name</Label>
            <Input placeholder="Stock name" />
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
              {isQuantifiable ? 'Exact item count' : 'Approximate usage'}
            </span>
          </div>
          {isQuantifiable && (
            <div className="flex gap-2">
              <NumberField
                isRequired
                minValue={1}
                name="totalItems"
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
                <FieldError />
              </NumberField>
              <NumberField
                minValue={0}
                className="flex-1"
                name="remainingItems"
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
                <FieldError />
              </NumberField>
            </div>
          )}
          {isQuantifiable && totalItems !== undefined && (
            <CustomButton
              size="sm"
              variant="ghost"
              onPress={() => {
                return setRemainingItems(totalItems);
              }}
            >
              Reset remaining to total
            </CustomButton>
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
              isDisabled={isSaving}
              onPress={handleCancel}
            >
              <XIcon className="size-4" />
              Cancel
            </CustomButton>
          </div>
        </ActionForm>
      )}
    </div>
  );
};

export default StockListItem;
