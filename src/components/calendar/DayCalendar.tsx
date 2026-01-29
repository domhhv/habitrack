import { cn, Button, Tooltip, Calendar, ScrollShadow } from '@heroui/react';
import {
  today,
  isToday,
  CalendarDate,
  toCalendarDate,
  getLocalTimeZone,
  toCalendarDateTime,
} from '@internationalized/date';
import {
  NoteIcon,
  NoteBlankIcon,
  NotePencilIcon,
  CalendarBlankIcon,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import groupBy from 'lodash.groupby';
import React from 'react';
import { useDateFormatter } from 'react-aria';
import { useParams, useNavigate } from 'react-router';

import { OccurrenceChip } from '@components';
import { useCurrentTime, useScreenWidth, useFirstDayOfWeek } from '@hooks';
import { StorageBuckets } from '@models';
import { getPublicUrl } from '@services';
import {
  useDayNotes,
  useOccurrences,
  useNoteDrawerActions,
  useCalendarRangeChange,
  useOccurrenceDrawerActions,
} from '@stores';
import { isDstTransitionDay, findDstTransitionHour } from '@utils';

import CalendarNavigationButtons from './CalendarNavigationButtons';

const DayCalendar = () => {
  const now = useCurrentTime();
  const changeCalendarRange = useCalendarRangeChange();
  const dayNotes = useDayNotes();
  const { isDesktop } = useScreenWidth();
  const { openNoteDrawer } = useNoteDrawerActions();
  const { openOccurrenceDrawer } = useOccurrenceDrawerActions();
  const occurrences = useOccurrences();
  const params = useParams();
  const navigate = useNavigate();
  const { firstDayOfWeek } = useFirstDayOfWeek();
  const timeZone = getLocalTimeZone();

  const formatter = useDateFormatter({
    dateStyle: 'full',
  });

  const [focusedDate, setFocusedDate] = React.useState(() => {
    return today(timeZone);
  });

  React.useEffect(() => {
    const currentDay = today(timeZone);

    const {
      day = currentDay.day,
      month = currentDay.month,
      year = currentDay.year,
    } = params;

    const paramsDate = new CalendarDate(
      Number(year),
      Number(month),
      Number(day)
    );

    if (focusedDate.toString() !== paramsDate.toString()) {
      setFocusedDate(toCalendarDate(paramsDate));
    }
  }, [params, timeZone, focusedDate]);

  React.useEffect(() => {
    const focusedDateTime = toCalendarDateTime(focusedDate);

    const rangeStart = focusedDateTime;
    const rangeEnd = focusedDateTime.set({
      hour: 23,
      millisecond: 999,
      minute: 59,
      second: 59,
    });

    changeCalendarRange([rangeStart, rangeEnd]);
  }, [focusedDate, changeCalendarRange]);

  const dayNote = React.useMemo(() => {
    return dayNotes.find((note) => {
      return note.periodDate === focusedDate.toString();
    });
  }, [dayNotes, focusedDate]);

  const dayOccurrences = React.useMemo(() => {
    return occurrences[focusedDate.toString()] || {};
  }, [occurrences, focusedDate]);

  const occurrenceSummary = React.useMemo(() => {
    const allOccurrences = Object.values(dayOccurrences);

    const grouped = groupBy(allOccurrences, (o) => {
      return o.habitId;
    });

    return Object.entries(grouped).map(([habitId, habitOccurrences]) => {
      const [first] = habitOccurrences;

      return {
        count: habitOccurrences.length,
        habitId,
        iconPath: first.habit.iconPath,
        name: first.habit.name,
        traitColor: first.habit.trait.color,
      };
    });
  }, [dayOccurrences]);

  const groupOccurrences = React.useCallback(
    (hour: number) => {
      const relatedOccurrences = Object.values(dayOccurrences).filter(
        ({ hasSpecificTime, occurredAt }) => {
          if (!hasSpecificTime) {
            return hour === 0;
          }

          return occurredAt.hour === hour;
        }
      );

      return Object.entries(
        groupBy(relatedOccurrences, (o) => {
          return o.habitId;
        })
      );
    },
    [dayOccurrences]
  );

  const dstType = isDstTransitionDay(focusedDate, timeZone);
  const dstHour = dstType ? findDstTransitionHour(focusedDate, timeZone) : null;
  const isFocusedToday = isToday(focusedDate, timeZone);

  const formattedDate = React.useMemo(() => {
    return formatter.format(focusedDate.toDate(timeZone));
  }, [formatter, focusedDate, timeZone]);

  const handleCalendarChange = (value: CalendarDate) => {
    navigate(`/calendar/day/${value.year}/${value.month}/${value.day}`);
  };

  return (
    <div className="flex w-full flex-1 gap-0 md:gap-6">
      <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto py-4 pr-1 pl-8 md:flex">
        <Calendar
          value={focusedDate}
          firstDayOfWeek={firstDayOfWeek}
          onChange={handleCalendarChange}
          classNames={{
            base: 'w-full shadow-none bg-transparent',
            content: 'w-full',
          }}
        />
        <div className="flex items-center justify-center gap-2">
          <CalendarNavigationButtons focusedDate={focusedDate} />
        </div>
        {dayNote && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <NoteIcon size={16} weight="bold" className="text-primary-500" />
              <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                Note
              </h4>
              <Button
                size="sm"
                isIconOnly
                variant="light"
                color="primary"
                className="h-5 w-5 min-w-fit"
                onPress={() => {
                  openNoteDrawer(focusedDate, 'day');
                }}
              >
                <NotePencilIcon size={14} weight="bold" />
              </Button>
            </div>
            <p className="line-clamp-4 text-sm text-stone-500 dark:text-stone-400">
              {dayNote.content}
            </p>
          </div>
        )}
        {!dayNote && (
          <Button
            size="sm"
            variant="flat"
            color="secondary"
            startContent={<NotePencilIcon size={14} weight="bold" />}
            onPress={() => {
              openNoteDrawer(focusedDate, 'day');
            }}
          >
            Add note
          </Button>
        )}
        {occurrenceSummary.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
              Summary
            </h4>
            <div className="space-y-1">
              {occurrenceSummary.map(
                ({ count, habitId, iconPath, name, traitColor }) => {
                  return (
                    <div
                      key={habitId}
                      className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300"
                    >
                      <img
                        alt={name}
                        className="h-4 w-4"
                        style={{ borderColor: traitColor }}
                        src={getPublicUrl(StorageBuckets.HABIT_ICONS, iconPath)}
                      />
                      <span>
                        {name}: {count}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
      </aside>
      <ScrollShadow className="relative flex-1 overflow-y-scroll">
        <div className="sticky top-0 z-20 flex items-center justify-center gap-4 bg-inherit px-8 py-2 md:hidden">
          <CalendarNavigationButtons focusedDate={focusedDate} />
        </div>
        <div className="flex items-center justify-center gap-2 px-8 py-2">
          <h2
            className={cn(
              'text-center text-lg text-stone-600 dark:text-stone-300',
              isFocusedToday &&
                'text-primary-600 dark:text-primary-400 font-bold'
            )}
          >
            {formattedDate}
          </h2>
          <div className="flex items-center gap-1">
            <Tooltip
              closeDelay={0}
              content={dayNote ? 'Edit note' : 'Add note'}
            >
              <Button
                radius="sm"
                variant="light"
                className="h-6 w-6 min-w-fit px-0"
                color={dayNote ? 'primary' : 'secondary'}
                aria-label={dayNote ? 'Edit note' : 'Add note'}
                onPress={() => {
                  openNoteDrawer(focusedDate, 'day');
                }}
              >
                {dayNote ? (
                  <NoteIcon weight="bold" size={isDesktop ? 18 : 14} />
                ) : (
                  <NoteBlankIcon weight="bold" size={isDesktop ? 18 : 14} />
                )}
              </Button>
            </Tooltip>
            <Tooltip closeDelay={0} content="Log occurrence">
              <Button
                radius="sm"
                variant="light"
                color="secondary"
                aria-label="Log occurrence"
                className="h-6 w-6 min-w-fit px-0"
                onPress={() => {
                  openOccurrenceDrawer({ dayToLog: focusedDate });
                }}
              >
                <CalendarBlankIcon weight="bold" size={isDesktop ? 18 : 14} />
              </Button>
            </Tooltip>
          </div>
        </div>
        <div className="flex flex-col px-8 py-4 lg:px-16">
          {[...Array(24).keys()].map((hour) => {
            const isSkippedHour = dstType === 'spring' && hour === dstHour;
            const isDuplicatedHour =
              dstType === 'fall' && dstHour !== null && hour === dstHour - 1;

            return (
              <div
                key={hour}
                className={cn(
                  'group/minutes-cell relative flex gap-4',
                  isSkippedHour && 'opacity-40'
                )}
              >
                <p className="w-6 shrink-0 -translate-y-3 text-right text-stone-600 dark:text-stone-200">
                  {hour !== 0 && hour}
                </p>
                <div
                  className={cn(
                    'flex h-20 w-full flex-wrap gap-2 overflow-x-hidden border-b border-stone-300 p-2 group-last-of-type/minutes-cell:border-b-0 dark:border-stone-500',
                    isSkippedHour && 'bg-stone-200/50 dark:bg-stone-700/50',
                    isDuplicatedHour &&
                      'border-l-warning-400 dark:border-l-warning-500 border-l-3'
                  )}
                >
                  {isSkippedHour && (
                    <p className="text-xs text-stone-400 italic dark:text-stone-500">
                      DST skip
                    </p>
                  )}
                  {isDuplicatedHour && (
                    <p className="text-warning-500 dark:text-warning-400 text-xs italic">
                      DST repeat
                    </p>
                  )}
                  {isFocusedToday && now.getHours() === hour && (
                    <div
                      className="bg-primary absolute right-0 left-0 z-10 h-0.5"
                      style={{
                        top: `${(now.getMinutes() / 60) * 100}%`,
                      }}
                    />
                  )}
                  {groupOccurrences(hour).map(([habitId, habitOccurrences]) => {
                    if (!habitOccurrences) {
                      return null;
                    }

                    return (
                      <motion.div
                        key={habitId}
                        exit={{ scale: 0 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <OccurrenceChip occurrences={habitOccurrences} />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollShadow>
    </div>
  );
};

export default DayCalendar;
