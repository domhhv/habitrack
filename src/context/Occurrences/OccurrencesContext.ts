import type { AddOccurrence, OccurrencesDateMap } from '@models';
import React from 'react';

import { type OccurrenceFilters } from './OccurrencesProvider';

type OccurrencesContextType = {
  addingOccurrence: boolean;
  fetchingOccurrences: boolean;
  occurrenceIdBeingDeleted: number;
  occurrencesByDate: OccurrencesDateMap;
  addOccurrence: (occurrence: AddOccurrence) => Promise<void>;
  removeOccurrence: (occurrenceId: number) => Promise<void>;
  removeOccurrencesByHabitId: (habitId: number) => void;
  filteredBy: {
    habitIds: Set<string>;
    traitIds: Set<string>;
  };
  filterBy: (filters: OccurrenceFilters) => void;
};

export const OccurrencesContext = React.createContext<OccurrencesContextType>({
  addingOccurrence: false,
  fetchingOccurrences: false,
  occurrenceIdBeingDeleted: 0,
  occurrencesByDate: {} as OccurrencesDateMap,
  addOccurrence: (_: AddOccurrence) => Promise.resolve(),
  removeOccurrence: (_: number) => Promise.resolve(),
  removeOccurrencesByHabitId: (_: number) => {},
  filteredBy: {
    habitIds: new Set() as Set<string>,
    traitIds: new Set() as Set<string>,
  },
  filterBy: (_: OccurrenceFilters) => {},
});

export const useOccurrences = () => {
  const context = React.useContext(OccurrencesContext);

  if (!context) {
    throw new Error('useOccurrences must be used within a OccurrencesContext');
  }

  return context;
};
