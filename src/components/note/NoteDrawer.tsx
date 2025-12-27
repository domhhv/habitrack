import {
  Drawer,
  Button,
  Slider,
  Textarea,
  DrawerBody,
  DrawerHeader,
  DrawerFooter,
  DrawerContent,
  RangeCalendar,
} from '@heroui/react';
import {
  today,
  endOfWeek,
  endOfMonth,
  startOfWeek,
  startOfMonth,
  getLocalTimeZone,
} from '@internationalized/date';
import {
  SunIcon,
  CaretLeftIcon,
  CaretRightIcon,
  NumberSevenIcon,
  CalendarDotsIcon,
} from '@phosphor-icons/react';
import React from 'react';
import { useLocale, useDateFormatter } from 'react-aria';

import { useUser, useTextField, useScreenWidth } from '@hooks';
import {
  usePeriodNotes,
  useNoteActions,
  useNoteDrawerState,
  useNoteDrawerActions,
} from '@stores';
import { toSqlDate, getISOWeek, handleAsyncAction } from '@utils';

const NoteDrawer = () => {
  const { locale } = useLocale();
  const { user } = useUser();
  const notes = usePeriodNotes();
  const { addNote, deleteNote, updateNote } = useNoteActions();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [content, handleContentChange, clearContent] = useTextField();
  const { isDesktop, isMobile } = useScreenWidth();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);
  const { isOpen, periodDate, periodKind } = useNoteDrawerState();
  const { closeNoteDrawer, setPeriodDate, setPeriodKind } =
    useNoteDrawerActions();
  const dayFormatter = useDateFormatter({
    day: 'numeric',
    month: 'short',
    timeZone,
    weekday: 'short',
    year: 'numeric',
  });
  const monthFormatter = useDateFormatter({
    month: 'long',
    timeZone,
  });

  const existingNote = React.useMemo(() => {
    if (!periodDate) {
      return undefined;
    }

    return notes.find((note) => {
      return (
        note.periodKind === periodKind &&
        note.periodDate === toSqlDate(periodDate)
      );
    });
  }, [notes, periodDate, periodKind]);

  React.useEffect(() => {
    if (isOpen && existingNote?.content) {
      handleContentChange(existingNote.content);
    } else {
      clearContent();
    }
  }, [existingNote, handleContentChange, isOpen, clearContent]);

  const handleSubmit = async () => {
    if (!user || !periodDate) {
      return null;
    }

    setIsSaving(true);

    if (content) {
      if (!existingNote) {
        void handleAsyncAction(
          addNote({
            content,
            periodDate: toSqlDate(periodDate),
            periodKind,
            userId: user.id,
          }),
          'add_note',
          setIsSaving
        ).then(handleClose);
      } else if (existingNote.content !== content) {
        void handleAsyncAction(
          updateNote(existingNote.id, {
            content,
            periodDate: toSqlDate(periodDate),
            periodKind,
          }),
          'update_note',
          setIsSaving
        ).then(handleClose);
      }
    }
  };

  const handleRemove = async () => {
    if (!existingNote) {
      return;
    }

    void handleAsyncAction(
      deleteNote(existingNote.id),
      'remove_note',
      setIsRemoving
    ).then(handleClose);
  };

  const handleClose = () => {
    setIsRemoving(false);
    setIsSaving(false);
    closeNoteDrawer();
    clearContent();
  };

  const formatPeriod = () => {
    if (!periodDate) {
      return '';
    }

    if (periodKind === 'day') {
      return dayFormatter.format(periodDate.toDate(timeZone));
    }

    if (periodKind === 'week') {
      return `week ${getISOWeek(periodDate.toDate(timeZone))} of ${monthFormatter.format(periodDate.toDate(timeZone))} ${periodDate.year}`;
    }

    if (periodKind === 'month') {
      return (
        monthFormatter.format(periodDate.toDate(timeZone)) +
        ' ' +
        periodDate.year
      );
    }
  };

  const getEndRangeDate = () => {
    if (!periodDate) {
      return today(getLocalTimeZone());
    }

    switch (periodKind) {
      case 'day':
        return periodDate;

      case 'week':
        return endOfWeek(periodDate, locale);

      case 'month':
        return endOfMonth(periodDate);

      default:
        return periodDate;
    }
  };

  const getTextareaDescription = () => {
    if (periodKind === 'day') {
      return `You're ${existingNote ? 'editing' : 'adding'} a note for a single day`;
    }

    if (periodKind === 'week') {
      return `You're ${existingNote ? 'editing' : 'adding'} a note for an entire week.`;
    }

    if (periodKind === 'month') {
      return `You're ${existingNote ? 'editing' : 'adding'} a note for the whole month.`;
    }

    return '';
  };

  return (
    <Drawer
      isOpen={isOpen}
      size={isMobile ? 'full' : 'lg'}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          closeNoteDrawer();
        }
      }}
    >
      <DrawerContent>
        <DrawerHeader>Note for {formatPeriod()}</DrawerHeader>
        <DrawerBody>
          <div className="flex h-74 justify-between gap-2">
            <Slider
              showSteps
              showTooltip
              minValue={1}
              maxValue={3}
              orientation="vertical"
              classNames={{
                mark: 'data-[in-range=true]:ml-4',
              }}
              marks={[
                {
                  label: 'Day',
                  value: 1,
                },
                {
                  label: 'Week',
                  value: 2,
                },
                {
                  label: 'Month',
                  value: 3,
                },
              ]}
              getTooltipValue={(value) => {
                if (value === 1) {
                  return 'Day note';
                }

                if (value === 2) {
                  return 'Week note';
                }

                if (value === 3) {
                  return 'Month note';
                }

                return '';
              }}
              renderThumb={(props) => {
                return (
                  <div
                    {...props}
                    className="bg-primary-600 left-1/2 mx-auto flex h-8 w-8 items-center justify-center rounded-full text-white"
                  >
                    {periodKind === 'day' && <SunIcon size={20} />}
                    {periodKind === 'week' && <NumberSevenIcon size={20} />}
                    {periodKind === 'month' && <CalendarDotsIcon size={20} />}
                  </div>
                );
              }}
              onChange={(value) => {
                if (!periodDate) {
                  return;
                }

                const nextValue = Array.isArray(value) ? value[0] : value;

                switch (nextValue) {
                  case 1:
                    setPeriodDate(periodDate);
                    setPeriodKind('day');
                    break;

                  case 2: {
                    const weekStart = startOfWeek(periodDate, locale);
                    setPeriodDate(weekStart);
                    setPeriodKind('week');
                    break;
                  }

                  case 3: {
                    const monthStart = startOfMonth(periodDate);
                    setPeriodDate(monthStart);
                    setPeriodKind('month');
                    break;
                  }
                }
              }}
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                isIconOnly
                variant="light"
                className="h-full w-5! min-w-auto"
                onPress={() => {
                  if (!periodDate) {
                    return;
                  }

                  switch (periodKind) {
                    case 'day':
                      return setPeriodDate(periodDate.subtract({ days: 1 }));

                    case 'week':
                      return setPeriodDate(periodDate.subtract({ weeks: 1 }));

                    case 'month':
                      return setPeriodDate(periodDate.subtract({ months: 1 }));
                  }
                }}
              >
                <CaretLeftIcon />
              </Button>
              <RangeCalendar
                isReadOnly
                focusedValue={periodDate}
                value={{
                  end: getEndRangeDate(),
                  start: periodDate || today(getLocalTimeZone()),
                }}
                classNames={{
                  cell: '[&_span]:cursor-default cursor-default',
                  nextButton: 'hidden',
                  prevButton: 'hidden',
                }}
              />
              <Button
                size="sm"
                isIconOnly
                variant="light"
                className="h-full w-5! min-w-auto"
                onPress={() => {
                  if (!periodDate) {
                    return;
                  }

                  switch (periodKind) {
                    case 'day':
                      return setPeriodDate(periodDate.add({ days: 1 }));

                    case 'week':
                      return setPeriodDate(periodDate.add({ weeks: 1 }));

                    case 'month':
                      return setPeriodDate(periodDate.add({ months: 1 }));
                  }
                }}
              >
                <CaretRightIcon />
              </Button>
            </div>
          </div>
          <Textarea
            value={content}
            variant="faded"
            disableAutosize
            placeholder="Note"
            onChange={handleContentChange}
            disabled={isSaving || isRemoving}
            description={getTextareaDescription()}
            onKeyDown={() => {
              return null;
            }}
            classNames={{
              input: 'resize-y min-h-25',
              ...(!isDesktop && {
                input: 'text-base',
              }),
            }}
          />
        </DrawerBody>
        <DrawerFooter>
          {!!existingNote && (
            <Button
              color="danger"
              disabled={isRemoving}
              onPress={handleRemove}
              isLoading={isRemoving}
            >
              Remove
            </Button>
          )}
          <Button
            type="submit"
            color="primary"
            isLoading={isSaving}
            onPress={handleSubmit}
            isDisabled={!content || isRemoving}
          >
            {existingNote ? 'Save' : 'Add'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default NoteDrawer;
