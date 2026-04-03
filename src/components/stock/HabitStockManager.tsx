import { Button } from '@heroui/react';
import { PlusIcon } from '@phosphor-icons/react';
import React from 'react';

import type { Habit } from '@models';

import AddStockForm from './AddStockForm';
import StockListItem from './StockListItem';

type HabitStockManagerProps = {
  habit: Habit;
};

const HabitStockManager = ({ habit }: HabitStockManagerProps) => {
  const [isAdding, setIsAdding] = React.useState(false);

  const activeStocks = habit.stocks.filter((s) => {
    return !s.isDepleted;
  });
  const depletedStocks = habit.stocks.filter((s) => {
    return s.isDepleted;
  });

  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <h2 className="text-sm font-medium">Stocks</h2>
        {!isAdding && (
          <Button
            size="sm"
            isIconOnly
            variant="ghost"
            aria-label="Add stock"
            onPress={() => {
              return setIsAdding(true);
            }}
          >
            <PlusIcon className="size-4" />
          </Button>
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
        {activeStocks.length > 0 && (
          <div className="flex flex-col gap-2">
            {activeStocks.map((stock) => {
              return (
                <StockListItem
                  stock={stock}
                  key={stock.id}
                  metricDefinitions={habit.metricDefinitions}
                />
              );
            })}
          </div>
        )}
        {depletedStocks.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            <p className="text-foreground-400 text-tiny">Depleted</p>
            {depletedStocks.map((stock) => {
              return (
                <StockListItem
                  stock={stock}
                  key={stock.id}
                  metricDefinitions={habit.metricDefinitions}
                />
              );
            })}
          </div>
        )}
        {!isAdding && habit.stocks.length === 0 && (
          <p className="text-default-500 italic">No stocks</p>
        )}
      </div>
    </div>
  );
};

export default HabitStockManager;
