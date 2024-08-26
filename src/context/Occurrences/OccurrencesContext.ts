import type { AddOccurrence, OccurrencesDateMap } from '@models';
import React from 'react';

import { type OccurrenceFilters } from './OccurrencesProvider';

export const OccurrencesContext = React.createContext({
  addingOccurrence: false,
  fetchingOccurrences: false,
  occurrenceIdBeingDeleted: 0,
  occurrencesByDate: {} as OccurrencesDateMap,
  addOccurrence: (_: AddOccurrence) => Promise.resolve(),
  removeOccurrence: (_: number) => Promise.resolve(),
  removeOccurrencesByHabitId: (_: number) => {},
  filteredBy: { habitIds: [] as number[], traitIds: [] as (string | number)[] },
  filterBy: (_: OccurrenceFilters) => {},
});

export const useOccurrences = () => {
  const context = React.useContext(OccurrencesContext);

  if (!context) {
    throw new Error('useOccurrences must be used within a OccurrencesContext');
  }

  return context;
};
