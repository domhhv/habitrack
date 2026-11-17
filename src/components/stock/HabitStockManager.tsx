import { PlusIcon } from '@phosphor-icons/react';
import React from 'react';

import { CustomButton } from '@components';
import { usePendingHabitWrites } from '@hooks';
import type { Habit } from '@models';

import AddStockForm from './AddStockForm';
import StockListItem from './StockListItem';

type HabitStockManagerProps = {
  habit: Habit;
};

const HabitStockManager = ({ habit }: HabitStockManagerProps) => {
  const [isAdding, setIsAdding] = React.useState(false);

  const { removedStockIds, stockDepletion } = usePendingHabitWrites();

  const stocks = habit.stocks
    .filter((stock) => {
      return !removedStockIds.includes(stock.id);
    })
    .map((stock) => {
      return {
        ...stock,
        isDepleted: stockDepletion[stock.id] ?? stock.isDepleted,
      };
    });
  const activeStocks = stocks.filter((s) => {
    return !s.isDepleted;
  });
  const depletedStocks = stocks.filter((s) => {
    return s.isDepleted;
  });

  const renderStock = (stock: (typeof stocks)[number]) => {
    return (
      <StockListItem
        stock={stock}
        key={stock.id}
        metricDefinitions={habit.metricDefinitions}
      />
    );
  };

  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <h2 className="text-sm font-medium">Stocks</h2>
        {!isAdding && (
          <CustomButton
            size="sm"
            isIconOnly
            variant="ghost"
            aria-label="Add stock"
            onPress={() => {
              return setIsAdding(true);
            }}
          >
            <PlusIcon className="size-4" />
          </CustomButton>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {isAdding && (
          <AddStockForm
            habit={habit}
            onClose={() => {
              return setIsAdding(false);
            }}
          />
        )}
        {[
          ...activeStocks.map(renderStock),
          depletedStocks.length > 0 && (
            <p key="depleted" className="text-foreground-400 text-tiny mt-2">
              Depleted
            </p>
          ),
          ...depletedStocks.map(renderStock),
        ]}
        {!isAdding && stocks.length === 0 && (
          <p className="text-default-500 italic">No stocks</p>
        )}
      </div>
    </div>
  );
};

export default HabitStockManager;
