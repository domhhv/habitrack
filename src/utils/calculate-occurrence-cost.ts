import type { HabitStockWithDefaults } from '@models';

type StockUsage = { habitStockId: string; quantity: number | null };

const calculateOccurrenceCost = (
  stocks: HabitStockWithDefaults[],
  stockUsages: StockUsage[]
) => {
  const stocksById = new Map(
    stocks.map((stock) => {
      return [stock.id, stock];
    })
  );
  const costEntries = stockUsages.flatMap(({ habitStockId, quantity }) => {
    const stock = stocksById.get(habitStockId);

    if (
      !stock ||
      stock.cost === null ||
      !stock.totalItems ||
      quantity === null
    ) {
      return [];
    }

    return [
      {
        amount: (stock.cost / stock.totalItems) * quantity,
        currency: stock.currency,
      },
    ];
  });
  const currencies = new Set(
    costEntries.map(({ currency }) => {
      return currency;
    })
  );

  if (costEntries.length === 0 || currencies.size !== 1) {
    return { cost: null, currency: null };
  }

  return {
    currency: costEntries[0].currency,
    cost: costEntries.reduce((sum, { amount }) => {
      return sum + amount;
    }, 0),
  };
};

export default calculateOccurrenceCost;
