import { cn, Tooltip, ScrollShadow } from '@heroui/react';
import {
  today,
  isToday,
  endOfWeek,
  startOfWeek,
  CalendarDate,
  createCalendar,
  toCalendarDate,
  getLocalTimeZone,
  toCalendarDateTime,
} from '@internationalized/date';
import {
  NoteIcon,
  NoteBlankIcon,
  CalendarBlankIcon,
  ArrowSquareRightIcon,
} from '@phosphor-icons/react';
import capitalize from 'lodash.capitalize';
import groupBy from 'lodash.groupby';
import React from 'react';
import { useLocale, useCalendar, useCalendarGrid } from 'react-aria';
import { useParams } from 'react-router';
import { useCalendarState } from 'react-stately';

import { CustomButton, OccurrenceChip } from '@components';
import { useCurrentTime, useScreenWidth, useFirstDayOfWeek } from '@hooks';
import {
  useDayNotes,
  useFlatOccurrences,
  useNoteDrawerActions,
  useCalendarRangeChange,
  useOccurrenceDrawerActions,
} from '@stores';
import { isDstTransitionDay, findDstTransitionHour } from '@utils';

import CalendarSidebar from './CalendarSidebar';

const WeekCalendar = () => {
  const now = useCurrentTime();
  const changeCalendarRange = useCalendarRangeChange();
  const dayNotes = useDayNotes();
  const [isFocusedDateInitialized, setIsFocusedDateInitialized] =
    React.useState(false);
  const { isDesktop, screenWidth } = useScreenWidth();
  const { openNoteDrawer } = useNoteDrawerActions();
  const { openOccurrenceDrawer } = useOccurrenceDrawerActions();
  const occurrences = useFlatOccurrences();
  const { locale } = useLocale();
  const params = useParams();
  const firstDayOfWeek = useFirstDayOfWeek();
  const state = useCalendarState({
    createCalendar,
    firstDayOfWeek,
    locale,
    visibleDuration: { weeks: 1 },
  });
  useCalendar({ firstDayOfWeek }, state);

  const weekStart = React.useMemo(() => {
    return startOfWeek(state.focusedDate, locale, firstDayOfWeek);
  }, [state.focusedDate, locale, firstDayOfWeek]);

  const weekDates = React.useMemo(() => {
    return [...Array(7).keys()].map((i) => {
      return weekStart.add({ days: i });
    });
  }, [weekStart]);

  const { gridProps, weekDays } = useCalendarGrid(
    {
      firstDayOfWeek,
      weekdayStyle: screenWidth > 1536 ? 'long' : 'short',
    },
    state
  );

  React.useEffect(() => {
    if (!isFocusedDateInitialized) {
      return;
    }

    const focusedDateTime = toCalendarDateTime(state.focusedDate);

    const rangeStart = startOfWeek(focusedDateTime, locale, firstDayOfWeek);
    const rangeEnd = endOfWeek(focusedDateTime, locale, firstDayOfWeek).set({
      hour: 23,
      millisecond: 999,
      minute: 59,
      second: 59,
    });

    changeCalendarRange([rangeStart, rangeEnd]);
  }, [
    state.focusedDate,
    firstDayOfWeek,
    changeCalendarRange,
    locale,
    isFocusedDateInitialized,
  ]);

  React.useEffect(() => {
    const currentWeek = startOfWeek(
      today(getLocalTimeZone()),
      locale,
      firstDayOfWeek
    ).add({ days: firstDayOfWeek === 'sun' ? 4 : 3 });

    const {
      day = currentWeek.day,
      month = currentWeek.month,
      year = currentWeek.year,
    } = params;

    const paramsDate = new CalendarDate(
      Number(year),
      Number(month),
      Number(day)
    );

    if (state.focusedDate.toString() !== paramsDate.toString()) {
      state.setFocusedDate(toCalendarDate(paramsDate));
      setIsFocusedDateInitialized(true);
    }
  }, [state, params, locale, firstDayOfWeek]);

  const hasNote = React.useCallback(
    (date: CalendarDate) => {
      return dayNotes.some((note) => {
        return note.periodDate === date.toString();
      });
    },
    [dayNotes]
  );

  const groupOccurrences = React.useCallback(
    (day: CalendarDate, hour: number) => {
      const relatedOccurrences = occurrences.filter(
        ({ hasSpecificTime, occurredAt }) => {
          const matchesDay =
            occurredAt.year === day.year &&
            occurredAt.month === day.month &&
            occurredAt.day === day.day;

          if (!hasSpecificTime) {
            return matchesDay && hour === 0;
          }

          return matchesDay && occurredAt.hour === hour;
        }
      );

      return Object.entries(
        groupBy(relatedOccurrences, (o) => {
          return o.habitId;
        })
      );
    },
    [occurrences]
  );

  return (
    <div className="flex w-full flex-1 flex-col gap-0 md:gap-6 lg:flex-row-reverse">
      <CalendarSidebar
        kind="week"
        focusedDate={state.focusedDate}
        className="hidden gap-2 pt-4 pb-2 lg:flex lg:w-84"
      />
      <ScrollShadow
        orientation="horizontal"
        className="relative w-full overflow-y-scroll"
      >
        <CalendarSidebar
          kind="week"
          summaryClassName="pt-2"
          focusedDate={state.focusedDate}
          className="sticky left-0 z-20 flex gap-2 py-4 max-lg:px-8 max-lg:py-4 lg:hidden"
        />
        <div
          {...gridProps}
          className="flex min-w-lg justify-around py-4 max-lg:px-8 xl:pr-2"
        >
          {weekDates.map((day, dayIndex) => {
            if (!day) {
              return null;
            }

            const isNoteAdded = hasNote(day);
            const dstType = isDstTransitionDay(day, getLocalTimeZone());
            const dstHour = dstType
              ? findDstTransitionHour(day, getLocalTimeZone())
              : null;

            return (
              <div
                key={dayIndex}
                className="group flex min-w-32 flex-1 flex-col gap-4"
              >
                <div
                  className={cn(
                    'space-y-2 text-center text-stone-600 dark:text-stone-300',
                    isToday(day, state.timeZone) &&
                      'text-primary-600 dark:text-primary-400 font-bold'
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <h3>{capitalize(weekDays[dayIndex])}</h3>
                    <div className="flex items-center justify-center gap-0.5">
                      <Tooltip closeDelay={0}>
                        <Tooltip.Trigger>
                          <CustomButton
                            variant="light"
                            aria-label={isNoteAdded ? 'Edit note' : 'Add note'}
                            onPress={() => {
                              openNoteDrawer(day, 'day');
                            }}
                            className={cn(
                              'h-5 w-5 min-w-fit rounded-xl px-0 lg:h-6 lg:w-6'
                            )}
                          >
                            {isNoteAdded ? (
                              <NoteIcon
                                weight="bold"
                                size={isDesktop ? 18 : 14}
                              />
                            ) : (
                              <NoteBlankIcon
                                weight="bold"
                                size={isDesktop ? 18 : 14}
                              />
                            )}
                          </CustomButton>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          {isNoteAdded ? 'Edit note' : 'Add note'}
                        </Tooltip.Content>
                      </Tooltip>
                      <Tooltip closeDelay={0}>
                        <Tooltip.Trigger>
                          <CustomButton
                            variant="light"
                            aria-label="Log occurrence"
                            className="h-5 w-5 min-w-fit rounded-xl px-0 lg:h-6 lg:w-6"
                            onPress={() => {
                              openOccurrenceDrawer({ dayToLog: day });
                            }}
                          >
                            <CalendarBlankIcon
                              weight="bold"
                              size={isDesktop ? 18 : 14}
                            />
                          </CustomButton>
                        </Tooltip.Trigger>
                        <Tooltip.Content>Log occurrence</Tooltip.Content>
                      </Tooltip>
                      <Tooltip closeDelay={0}>
                        <Tooltip.Trigger>
                          <CustomButton
                            variant="light"
                            aria-label="Open day"
                            href={`/calendar/day/${day.year}/${day.month}/${day.day}`}
                            className="h-5 w-5 min-w-fit rounded-xl px-0 lg:h-6 lg:w-6"
                          >
                            <ArrowSquareRightIcon
                              weight="bold"
                              size={isDesktop ? 18 : 14}
                            />
                          </CustomButton>
                        </Tooltip.Trigger>
                        <Tooltip.Content>Open day</Tooltip.Content>
                      </Tooltip>
                    </div>
                  </div>
                  <h6>{day.day}</h6>
                </div>
                <div
                  className={cn(
                    'border-border flex flex-col border-r group-last-of-type:border-r-0',
                    isToday(day, state.timeZone) &&
                      'to-background-secondary bg-linear-to-b from-transparent from-0% to-[4px]'
                  )}
                >
                  {[...Array(24).keys()].map((hour) => {
                    const isSkippedHour =
                      dstType === 'spring' && hour === dstHour;
                    const isDuplicatedHour =
                      dstType === 'fall' &&
                      dstHour !== null &&
                      hour === dstHour - 1;

                    const isCurrentHour =
                      isToday(day, state.timeZone) && now.getHours() === hour;

                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className="group/minutes-cell relative flex gap-4"
                      >
                        {dayIndex === 0 && (
                          <p className="text-foreground absolute -top-3.25 -left-6 w-3 basis-0 translate-0 self-start text-right md:static md:-translate-y-3 md:text-base">
                            {hour !== 0 && hour}
                          </p>
                        )}
                        <div
                          className={cn(
                            'border-border flex h-20 w-full flex-wrap gap-2 overflow-x-hidden border-b p-2 group-last-of-type/minutes-cell:border-b-0',
                            isSkippedHour && 'bg-background-secondary',
                            isDuplicatedHour && 'border-l-warning border-l-3'
                          )}
                        >
                          {isSkippedHour && (
                            <p className="text-muted text-xs italic">
                              DST skip
                            </p>
                          )}
                          {isDuplicatedHour && (
                            <p className="text-warning text-xs italic">
                              DST repeat
                            </p>
                          )}
                          {isCurrentHour && (
                            <div
                              className="bg-accent absolute right-0 left-0 z-10 h-0.5"
                              style={{
                                top: `${(now.getMinutes() / 60) * 100}%`,
                              }}
                            />
                          )}
                          {groupOccurrences(day, hour).map(
                            ([habitId, habitOccurrences]) => {
                              if (!habitOccurrences) {
                                return null;
                              }

                              return (
                                <div key={habitId}>
                                  <OccurrenceChip
                                    occurrences={habitOccurrences}
                                  />
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
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

export default WeekCalendar;
