import { cn, Tooltip, ScrollShadow } from '@heroui/react';
import { isToday, getLocalTimeZone } from '@internationalized/date';
import {
  NoteIcon,
  NoteBlankIcon,
  CalendarBlankIcon,
} from '@phosphor-icons/react';
import capitalize from 'lodash.capitalize';
import groupBy from 'lodash.groupby';
import React, { ViewTransition } from 'react';
import { useLocale, useDateFormatter } from 'react-aria';
import { useParams, useNavigate } from 'react-router';

import { CustomButton, OccurrenceChip, SwipeableContainer } from '@components';
import {
  useCurrentTime,
  useScreenWidth,
  useCalendarData,
  useFirstDayOfWeek,
} from '@hooks';
import { useNoteDrawerActions, useOccurrenceDrawerActions } from '@stores';
import {
  getCalendarHref,
  isDstTransitionDay,
  findDstTransitionHour,
  getFocusedCalendarDate,
} from '@utils';

import CalendarPeriodTransition from './CalendarPeriodTransition';
import CalendarSidebar from './CalendarSidebar';

const DayCalendar = () => {
  const now = useCurrentTime();
  const { dayNotes, occurrences } = useCalendarData();
  const { isDesktop } = useScreenWidth();
  const { openNoteDrawer } = useNoteDrawerActions();
  const { openOccurrenceDrawer } = useOccurrenceDrawerActions();
  const params = useParams();
  const navigate = useNavigate();
  const { locale } = useLocale();
  const firstDayOfWeek = useFirstDayOfWeek();
  const timeZone = getLocalTimeZone();
  const focusedDate = React.useMemo(() => {
    return getFocusedCalendarDate(
      'day',
      params,
      locale,
      firstDayOfWeek,
      timeZone
    );
  }, [params, locale, firstDayOfWeek, timeZone]);

  const formatter = useDateFormatter({
    dateStyle: 'full',
  });

  const dayNote = React.useMemo(() => {
    return dayNotes.find((note) => {
      return note.periodDate === focusedDate.toString();
    });
  }, [dayNotes, focusedDate]);

  const dayOccurrences = React.useMemo(() => {
    return occurrences.filter((occurrence) => {
      return (
        occurrence.occurredAt.year === focusedDate.year &&
        occurrence.occurredAt.month === focusedDate.month &&
        occurrence.occurredAt.day === focusedDate.day
      );
    });
  }, [occurrences, focusedDate]);

  const groupOccurrences = React.useCallback(
    (hour: number) => {
      const relatedOccurrences = dayOccurrences.filter(
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

  const handleSwipeLeft = () => {
    const nextDay = focusedDate.add({ days: 1 });
    navigate(getCalendarHref('day', nextDay));
  };

  const handleSwipeRight = () => {
    const prevDay = focusedDate.subtract({ days: 1 });
    navigate(getCalendarHref('day', prevDay));
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-0 px-8 md:gap-2 lg:flex-row">
      <ScrollShadow className="relative flex-1 overflow-y-scroll">
        <CalendarSidebar
          kind="day"
          summaryClassName="pt-2"
          focusedDate={focusedDate}
          className="sticky top-0 z-20 flex gap-2 bg-inherit py-2 max-lg:py-0 lg:hidden"
        />
        <SwipeableContainer
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        >
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="flex items-center gap-3">
              <h2
                className={cn(
                  'text-muted text-center text-base',
                  isFocusedToday &&
                    'text-primary-600 dark:text-primary-400 font-bold'
                )}
              >
                {capitalize(formattedDate)}
              </h2>
              <div className="flex items-center gap-2">
                <Tooltip closeDelay={0}>
                  <Tooltip.Trigger>
                    <CustomButton
                      variant="light"
                      className="h-6 w-6 min-w-fit rounded-xl px-0"
                      aria-label={dayNote ? 'Edit note' : 'Add note'}
                      onPress={() => {
                        openNoteDrawer(focusedDate, 'day');
                      }}
                    >
                      {dayNote ? (
                        <NoteIcon weight="bold" size={isDesktop ? 18 : 14} />
                      ) : (
                        <NoteBlankIcon
                          weight="bold"
                          size={isDesktop ? 18 : 14}
                        />
                      )}
                    </CustomButton>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    {dayNote ? 'Edit note' : 'Add note'}
                  </Tooltip.Content>
                </Tooltip>
                <Tooltip closeDelay={0}>
                  <Tooltip.Trigger>
                    <CustomButton
                      variant="light"
                      aria-label="Log occurrence"
                      className="h-6 w-6 min-w-fit rounded-xl px-0"
                      onPress={() => {
                        openOccurrenceDrawer({ dayToLog: focusedDate });
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
              </div>
            </div>
          </div>
          <CalendarPeriodTransition period={focusedDate.toString()}>
            <div
              key={focusedDate.toString()}
              className="flex flex-col py-4 pr-8"
            >
              {[...Array(24).keys()].map((hour) => {
                const isSkippedHour = dstType === 'spring' && hour === dstHour;
                const isDuplicatedHour =
                  dstType === 'fall' &&
                  dstHour !== null &&
                  hour === dstHour - 1;
                const isCurrentHour = isFocusedToday && now.getHours() === hour;

                return (
                  <div
                    key={hour}
                    className="group/minutes-cell relative flex gap-4"
                  >
                    <p
                      className={cn(
                        'text-foreground w-6 shrink-0 -translate-y-3 text-right',
                        (isSkippedHour || isDuplicatedHour) && 'text-muted',
                        isCurrentHour && 'text-accent font-extrabold'
                      )}
                    >
                      {hour !== 0 && hour}
                    </p>
                    <div
                      className={cn(
                        'border-border flex h-20 w-full flex-wrap gap-2 overflow-x-hidden border-b p-2 group-last-of-type/minutes-cell:border-b-0',
                        isSkippedHour && 'bg-background-secondary',
                        isDuplicatedHour && 'border-l-warning border-l-3'
                      )}
                    >
                      {isSkippedHour && (
                        <p className="text-muted text-xs italic">DST skip</p>
                      )}
                      {isDuplicatedHour && (
                        <p className="text-warning italic">DST repeat</p>
                      )}
                      {isCurrentHour && (
                        <div
                          className="bg-accent absolute right-0 left-0 z-10 h-0.5"
                          style={{
                            top: `${(now.getMinutes() / 60) * 100}%`,
                          }}
                        />
                      )}
                      {groupOccurrences(hour).map(
                        ([habitId, habitOccurrences]) => {
                          if (!habitOccurrences) {
                            return null;
                          }

                          return (
                            <ViewTransition
                              key={habitId}
                              default="none"
                              exit="chip-exit"
                              enter="chip-enter"
                            >
                              <OccurrenceChip occurrences={habitOccurrences} />
                            </ViewTransition>
                          );
                        }
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CalendarPeriodTransition>
        </SwipeableContainer>
      </ScrollShadow>
      <CalendarSidebar
        kind="day"
        focusedDate={focusedDate}
        className="hidden gap-2 py-4 lg:flex lg:w-84"
      />
    </div>
  );
};

export default DayCalendar;
