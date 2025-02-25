import { cn, useDisclosure } from '@heroui/react';
import { useDocumentTitle } from '@hooks';
import { CalendarDate, GregorianCalendar } from '@internationalized/date';
import { useOccurrencesStore } from '@stores';
import { capitalizeFirstLetter } from '@utils';
import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  startOfToday,
} from 'date-fns';
import React from 'react';
import { useCalendar, useLocale } from 'react-aria';
import { useParams } from 'react-router';
import { useCalendarState } from 'react-stately';
import { useShallow } from 'zustand/react/shallow';

import MonthCalendarGrid from './MonthCalendarGrid';
import MonthCalendarHeader from './MonthCalendarHeader';
import NoteDialog from './NoteDialog';
import OccurrenceDialog from './OccurrenceDialog';

const createCalendar = (identifier: string) => {
  switch (identifier) {
    case 'gregory':
      return new GregorianCalendar();
    default:
      throw new Error(`Unsupported calendar ${identifier}`);
  }
};

const MonthCalendar = () => {
  const onRangeChange = useOccurrencesStore(
    useShallow((state) => state.onRangeChange)
  );
  const { locale } = useLocale();
  const calendarState = useCalendarState({
    locale,
    createCalendar,
  });
  const { calendarProps, title } = useCalendar({}, calendarState);
  const {
    isOpen: isNoteDialogOpen,
    onOpen: openNoteDialog,
    onClose: closeNoteDialog,
  } = useDisclosure();
  const {
    isOpen: isOccurrenceDialogOpen,
    onOpen: openOccurrenceDialog,
    onClose: closeOccurrenceDialog,
  } = useDisclosure();
  const [occurrenceToAddDate, setOccurrenceToAddDate] =
    React.useState<Date | null>(null);
  const [noteToAddDay, setNoteToAddDay] = React.useState<string | null>(null);
  const [occurrenceIdToEdit, setOccurrenceIdToEdit] = React.useState<
    number | null
  >(null);
  const params = useParams();

  React.useEffect(() => {
    const currentMonth = startOfMonth(startOfToday());

    const {
      year = currentMonth.getFullYear(),
      month = currentMonth.getMonth() + 1,
      day = currentMonth.getDate(),
    } = params;

    const focusedDate = new Date(Number(year), Number(month) - 1, Number(day));

    const rangeStart = startOfWeek(startOfMonth(focusedDate));
    const rangeEnd = endOfWeek(endOfMonth(focusedDate));

    onRangeChange([+rangeStart, +rangeEnd]);

    const nextFocusedDate = new CalendarDate(
      focusedDate.getFullYear(),
      focusedDate.getMonth() + 1,
      focusedDate.getDate()
    );

    const hasFocusedDateChanged =
      calendarState.focusedDate.toString() !== nextFocusedDate.toString();

    if (hasFocusedDateChanged) {
      calendarState.setFocusedDate(nextFocusedDate);
    }
  }, [params, calendarState, onRangeChange]);

  const [activeMonthLabel, activeYear] = title.split(' ');

  useDocumentTitle(
    `${activeMonthLabel.slice(0, 3)} ${activeYear} | Habitrack Calendar`
  );

  const handleOccurrenceModalClose = () => {
    window.setTimeout(() => {
      setOccurrenceToAddDate(null);
      setOccurrenceIdToEdit(null);
      closeOccurrenceDialog();
    }, 0);
  };

  const handleOccurrenceModalAdd = (
    dateNumber: number,
    monthIndex: number,
    fullYear: number
  ) => {
    setOccurrenceToAddDate(new Date(fullYear, monthIndex - 1, dateNumber, 12));
    openOccurrenceDialog();
  };

  const handleOccurrenceModalEdit = (occurrenceId: number) => {
    setOccurrenceIdToEdit(occurrenceId);
    openOccurrenceDialog();
  };

  const handleNoteModalClose = () => {
    window.setTimeout(() => {
      setOccurrenceToAddDate(null);
      closeNoteDialog();
    }, 0);
  };

  const handleNoteModalOpen = (
    dayOfMonth: number,
    monthIndex: number,
    fullYear: number
  ) => {
    const month = monthIndex < 10 ? `0${monthIndex}` : monthIndex;
    const day = dayOfMonth < 10 ? `0${dayOfMonth}` : dayOfMonth;
    setNoteToAddDay(`${fullYear}-${month}-${day}`);
    openNoteDialog();
  };

  const calendarContainerClassName = cn(
    'flex h-full w-full max-w-full flex-1 flex-col gap-2 p-0 px-8 pb-8 lg:gap-4 lg:px-16 lg:py-4',
    isOccurrenceDialogOpen && 'pointer-events-none'
  );

  return (
    <>
      <div {...calendarProps} className={calendarContainerClassName}>
        <MonthCalendarHeader
          activeMonthLabel={capitalizeFirstLetter(activeMonthLabel)}
          activeYear={activeYear}
        />
        <MonthCalendarGrid
          activeMonthLabel={capitalizeFirstLetter(activeMonthLabel)}
          activeYear={Number(activeYear)}
          state={calendarState}
          onAddOccurrence={handleOccurrenceModalAdd}
          onAddNote={handleNoteModalOpen}
          onEditOccurrence={handleOccurrenceModalEdit}
        />
      </div>

      <OccurrenceDialog
        isOpen={isOccurrenceDialogOpen}
        onClose={handleOccurrenceModalClose}
        date={occurrenceToAddDate}
        occurrenceId={occurrenceIdToEdit}
      />

      <NoteDialog
        open={isNoteDialogOpen}
        onClose={handleNoteModalClose}
        day={noteToAddDay}
      />
    </>
  );
};

export default MonthCalendar;
