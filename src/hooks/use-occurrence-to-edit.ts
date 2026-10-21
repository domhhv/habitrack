import React from 'react';

import { useOccurrenceDrawerState } from '@stores';

import useCalendarData from './use-calendar-data';

const useOccurrenceToEdit = () => {
  const { occurrenceIdToEdit } = useOccurrenceDrawerState();
  const { occurrences } = useCalendarData();

  return React.useMemo(() => {
    return occurrences.find(({ id }) => {
      return id === occurrenceIdToEdit;
    });
  }, [occurrences, occurrenceIdToEdit]);
};

export default useOccurrenceToEdit;
