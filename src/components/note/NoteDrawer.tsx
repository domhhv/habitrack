import {
  cn,
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
  CaretDownIcon,
  CaretRightIcon,
  NumberSevenIcon,
  CalendarDotsIcon,
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const timeZone = getLocalTimeZone();
  const notes = usePeriodNotes();
  const { addNote, deleteNote, updateNote } = useNoteActions();
  const { locale } = useLocale();
  const { user } = useUser();
  const [content, handleContentChange, clearContent] = useTextField();
  const { isDesktop, isMobile, screenWidth } = useScreenWidth();
  const [isPeriodPickerShown, setIsPeriodPickerShown] = React.useState(false);
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
  const shortMonthFormatter = useDateFormatter({
    month: 'short',
    timeZone,
  });
  const longMonthFormatter = useDateFormatter({
    month: 'long',
    timeZone,
  });

  const existingNote = React.useMemo(() => {
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

  const closeDrawer = () => {
    setIsRemoving(false);
    setIsSaving(false);
    closeNoteDrawer();
    clearContent();
  };

  const submitNote = async () => {
    if (!user || !periodDate || !content) {
      return null;
    }

    if (!existingNote) {
      return handleAsyncAction(
        addNote({
          content,
          periodDate: toSqlDate(periodDate),
          periodKind,
          userId: user.id,
        }),
        'add_note',
        setIsSaving
      ).then(closeDrawer);
    }

    if (existingNote.content !== content) {
      return handleAsyncAction(
        updateNote(existingNote.id, {
          content,
          periodDate: toSqlDate(periodDate),
          periodKind,
        }),
        'update_note',
        setIsSaving
      ).then(closeDrawer);
    }
  };

  const removeNote = async () => {
    if (!existingNote) {
      return;
    }

    void handleAsyncAction(
      deleteNote(existingNote.id),
      'remove_note',
      setIsRemoving
    ).then(closeDrawer);
  };

  const formatPeriod = () => {
    if (periodKind === 'day') {
      return dayFormatter.format(periodDate.toDate(timeZone));
    }

    if (periodKind === 'week') {
      return `week ${getISOWeek(periodDate.toDate(timeZone))} of ${longMonthFormatter.format(periodDate.toDate(timeZone))} ${periodDate.year}`;
    }

    if (periodKind === 'month') {
      return `${longMonthFormatter.format(periodDate.toDate(timeZone))} ${periodDate.year}`;
    }

    return '';
  };

  const getEndRangeDate = () => {
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
    const action = existingNote ? 'editing' : 'adding';

    if (periodKind === 'day') {
      return `You're ${action} a note for a single day`;
    }

    if (periodKind === 'week') {
      return `You're ${action} a note for an entire week: ${shortMonthFormatter.format(periodDate.toDate(timeZone))} ${periodDate.day} to ${shortMonthFormatter.format(getEndRangeDate().toDate(timeZone))} ${getEndRangeDate().day}. It will live independently from notes added for any days of this week.`;
    }

    if (periodKind === 'month') {
      return `You're ${action} a note for the whole month: ${shortMonthFormatter.format(periodDate.toDate(timeZone))} ${periodDate.day}-${getEndRangeDate().day}. It will live independently from notes added for any days or weeks of this month.`;
    }

    return '';
  };

  const togglePeriodPicker = () => {
    setIsPeriodPickerShown((prev) => {
      return !prev;
    });
  };

  const changeOpen = (isOpen: boolean) => {
    if (!isOpen) {
      closeNoteDrawer();
      setIsPeriodPickerShown(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={changeOpen}
      size={isMobile ? 'full' : 'lg'}
    >
      <DrawerContent>
        <DrawerHeader className="items-center gap-2">
          Note for {formatPeriod()}
          <Button
            size="sm"
            isIconOnly
            variant="light"
            onPress={togglePeriodPicker}
          >
            <CaretDownIcon size={16} />
          </Button>
        </DrawerHeader>
        <DrawerBody>
          <AnimatePresence mode="wait">
            {isPeriodPickerShown && (
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0,
                }}
                className="flex justify-between gap-2 max-[446px]:flex-col max-[446px]:items-center max-[446px]:justify-start max-[446px]:gap-4"
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: {
                      duration: 0.4,
                    },
                    opacity: {
                      duration: 0.25,
                    },
                  },
                }}
                animate={{
                  height: screenWidth > 445 ? 296 : 380,
                  opacity: 1,
                  transition: {
                    height: {
                      duration: 0.4,
                    },
                    opacity: {
                      delay: 0.15,
                      duration: 0.25,
                    },
                  },
                }}
              >
                <Slider
                  showSteps
                  showTooltip
                  minValue={1}
                  maxValue={3}
                  value={['day', 'week', 'month'].indexOf(periodKind) + 1}
                  orientation={screenWidth > 445 ? 'vertical' : 'horizontal'}
                  classNames={{
                    mark: 'min-[446px]:data-[in-range=true]:ml-4 max-[446px]:mt-2',
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
                        className="bg-primary-600 top-1/2 left-1/2 mx-auto flex h-8 w-8 items-center justify-center rounded-full text-white"
                      >
                        {periodKind === 'day' && <SunIcon size={20} />}
                        {periodKind === 'week' && <NumberSevenIcon size={20} />}
                        {periodKind === 'month' && (
                          <CalendarDotsIcon size={20} />
                        )}
                      </div>
                    );
                  }}
                  onChange={(value) => {
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
                      switch (periodKind) {
                        case 'day':
                          return setPeriodDate(
                            periodDate.subtract({ days: 1 })
                          );

                        case 'week':
                          return setPeriodDate(
                            periodDate.subtract({ weeks: 1 })
                          );

                        case 'month':
                          return setPeriodDate(
                            periodDate.subtract({ months: 1 })
                          );
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
                      start: periodDate || today(timeZone),
                    }}
                    classNames={{
                      cell: '[&_span]:cursor-default! cursor-default',
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
              </motion.div>
            )}
          </AnimatePresence>
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
              input: cn('resize-y min-h-25', !isDesktop && 'text-base'),
            }}
          />
        </DrawerBody>
        <DrawerFooter>
          {!!existingNote && (
            <Button
              color="danger"
              onPress={removeNote}
              disabled={isRemoving}
              isLoading={isRemoving}
            >
              Remove
            </Button>
          )}
          <Button
            type="submit"
            color="primary"
            isLoading={isSaving}
            onPress={submitNote}
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
