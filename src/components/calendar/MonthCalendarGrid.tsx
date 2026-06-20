import { cn, Tooltip } from '@heroui/react';
import type { CalendarDate } from '@internationalized/date';
import { toZoned, getWeeksInMonth } from '@internationalized/date';
import { NoteIcon, NotePencilIcon } from '@phosphor-icons/react';
import capitalize from 'lodash.capitalize';
import React from 'react';
import { useLocale, useCalendarGrid } from 'react-aria';
import type { CalendarState } from 'react-stately';

import { CustomButton } from '@components';
import { useScreenWidth, useFirstDayOfWeek } from '@hooks';
import {
  useWeekNotes,
  useOccurrences,
  useCalendarFilters,
  useNoteDrawerActions,
} from '@stores';
import { getISOWeek } from '@utils';

import type { CellPosition } from './MonthCalendarCell';
import MonthCalendarCell from './MonthCalendarCell';

type MonthCalendarGridProps = {
  state: CalendarState;
};

const MonthCalendarGrid = ({ state }: MonthCalendarGridProps) => {
  const filters = useCalendarFilters();
  const occurrences = useOccurrences();
  const firstDayOfWeek = useFirstDayOfWeek();
  const { gridProps, weekDays } = useCalendarGrid(
    {
      firstDayOfWeek,
      weekdayStyle: 'short',
    },
    state
  );
  const { isDesktop } = useScreenWidth();
  const { locale } = useLocale();
  const weeksInMonthCount = getWeeksInMonth(
    state.visibleRange.start,
    locale,
    firstDayOfWeek
  );
  const weekIndexes = [...new Array(weeksInMonthCount).keys()];
  const weekNotes = useWeekNotes();
  const { openNoteDrawer } = useNoteDrawerActions();

  const getCellPosition = (
    weekIndex: number,
    dayIndex: number
  ): CellPosition => {
    if (weekIndex === 0 && dayIndex === 0) {
      return 'top-left';
    }

    if (weekIndex === 0 && dayIndex === 6) {
      return 'top-right';
    }

    if (weekIndex === weeksInMonthCount - 1 && dayIndex === 0) {
      return 'bottom-left';
    }

    if (weekIndex === weeksInMonthCount - 1 && dayIndex === 6) {
      return 'bottom-right';
    }

    return '';
  };

  return (
    <div {...gridProps} className="flex flex-1 flex-col gap-0 lg:gap-1">
      <div className="mb-1 flex">
        {weekDays.map((weekDay) => {
          return (
            <div
              key={weekDay}
              className="flex flex-1 items-center justify-center text-neutral-600 dark:text-neutral-300"
            >
              <p className="font-bold">{capitalize(weekDay)}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-1 flex-col">
        {weekIndexes.map((weekIndex) => {
          const daysOfWeek = state
            .getDatesInWeek(weekIndex)
            .filter((value): value is CalendarDate => {
              return Boolean(value);
            });
          const [firstDayOfWeek] = daysOfWeek;
          const monday = daysOfWeek.find((d) => {
            return d.toDate(state.timeZone).getDay() === 1;
          });
          const thursday = daysOfWeek.find((d) => {
            return d.toDate(state.timeZone).getDay() === 4;
          });

          if (!monday || !thursday) {
            return null;
          }

          const weekNote = weekNotes.find((note) => {
            return note.periodDate === monday.toString();
          });

          const weekIsoNumber = getISOWeek(monday.toDate(state.timeZone));

          return (
            <div
              key={weekIndex}
              className="group relative flex items-end gap-1 md:gap-2"
            >
              <div
                className={cn(
                  'absolute -left-7 flex h-full flex-col lg:-left-9',
                  weekIndex === 0 ? 'gap-1 lg:gap-1.5' : 'gap-0.5 lg:gap-1'
                )}
              >
                <Tooltip closeDelay={0}>
                  <Tooltip.Trigger>
                    <CustomButton
                      size="sm"
                      variant="tertiary"
                      aria-label={`Go to week ${weekIsoNumber}`}
                      href={`/calendar/week/${thursday.year}/${thursday.month}/${thursday.day}`}
                      className={cn(
                        'mt-0 h-6.75 w-6 min-w-fit p-0 lg:h-7.75 lg:w-7',
                        weekIndex === 0 && 'top-0.5'
                      )}
                    >
                      {getISOWeek(monday.toDate(state.timeZone))}
                    </CustomButton>
                  </Tooltip.Trigger>
                  <Tooltip.Content>Go to this week</Tooltip.Content>
                </Tooltip>
                <Tooltip closeDelay={0}>
                  <Tooltip.Trigger>
                    <CustomButton
                      isIconOnly
                      variant="outline"
                      onPress={() => {
                        openNoteDrawer(firstDayOfWeek, 'week');
                      }}
                      aria-label={
                        weekNote
                          ? `Edit note about week ${weekIndex + 1}`
                          : `Add note about week ${weekIndex + 1}`
                      }
                      className={cn(
                        'text-accent mb-0 h-19.75 w-6 min-w-fit rounded-3xl p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 lg:h-26.75 lg:w-7',
                        (weekNote || !isDesktop) && 'opacity-100',
                        weekIndex === 0 && 'h-19.25 lg:h-26.75'
                      )}
                    >
                      {weekNote ? (
                        <NoteIcon size={16} weight="bold" />
                      ) : (
                        <NotePencilIcon size={16} weight="bold" />
                      )}
                    </CustomButton>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    {weekNote
                      ? 'Edit note about this week'
                      : 'Add note about this week'}
                  </Tooltip.Content>
                </Tooltip>
              </div>
              <div
                className={cn(
                  'border-border flex h-27.5 w-full basis-full justify-between border-r-2 border-l-2 group-first-of-type:border-t-2 last-of-type:border-b-2 lg:h-auto',
                  weekIndex === 0 && 'rounded-t-3xl',
                  weekIndex === weeksInMonthCount - 1 && 'rounded-b-3xl'
                )}
              >
                {state
                  .getDatesInWeek(weekIndex)
                  .map((calendarDate, dayIndex) => {
                    if (!calendarDate) {
                      return null;
                    }

                    const startDate = toZoned(calendarDate, state.timeZone).set(
                      {
                        hour: 0,
                        millisecond: 0,
                        minute: 0,
                        second: 0,
                      }
                    );

                    const endDate = toZoned(calendarDate, state.timeZone).set({
                      hour: 23,
                      millisecond: 999,
                      minute: 59,
                      second: 59,
                    });

                    const dayOccurrences =
                      occurrences[calendarDate.toString()] || {};

                    return (
                      <MonthCalendarCell
                        state={state}
                        date={calendarDate}
                        key={calendarDate.toString()}
                        position={getCellPosition(weekIndex, dayIndex)}
                        occurrences={Object.values(dayOccurrences).filter(
                          (o) => {
                            return (
                              o.occurredAt.compare(startDate) >= 0 &&
                              o.occurredAt.compare(endDate) <= 0 &&
                              filters.habitIds.includes(o.habitId) &&
                              (o.habit.trait
                                ? filters.traitIds.includes(
                                    o.habit.trait?.id || ''
                                  )
                                : true)
                            );
                          }
                        )}
                      />
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendarGrid;
