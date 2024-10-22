import type { OccurrencesDateMap, OccurrencesInsert } from '@models';
import React from 'react';

import { type OccurrenceFilters } from './OccurrencesProvider';

type OccurrencesContextType = {
  addingOccurrence: boolean;
  fetchingOccurrences: boolean;
  occurrenceIdBeingDeleted: number;
  occurrencesByDate: OccurrencesDateMap;
  addOccurrence: (occurrence: OccurrencesInsert) => Promise<void>;
  removeOccurrence: (occurrenceId: number) => Promise<void>;
  removeOccurrencesByHabitId: (habitId: number) => void;
  filterBy: (filters: OccurrenceFilters) => void;
  filteredBy: {
    habitIds: Set<string>;
    traitIds: Set<string>;
  };
};

export const OccurrencesContext =
  React.createContext<OccurrencesContextType | null>(null);

export const useOccurrences = () => {
  const context = React.useContext(OccurrencesContext);

  if (!context) {
    throw new Error('useOccurrences must be used within a OccurrencesContext');
  }

  return context;
};
