import { cn, Calendar, ButtonGroup } from '@heroui/react';
import type { CalendarDate } from '@internationalized/date';
import {
  today,
  endOfWeek,
  endOfMonth,
  startOfWeek,
  startOfMonth,
  toCalendarDate,
  getLocalTimeZone,
} from '@internationalized/date';
import React from 'react';
import { useLocale } from 'react-aria';
import { useNavigate } from 'react-router';

import { CustomButton } from '@components';
import { useFirstDayOfWeek } from '@hooks';
import type { NotePeriodKind } from '@models';
import {
  useDayNotes,
  useWeekNotes,
  useMonthNotes,
  useFlatOccurrences,
} from '@stores';
import { buildMetricTotals, buildOccurrenceSummary } from '@utils';

import CalendarFilters from './CalendarFilters';
import CalendarNavigation from './CalendarNavigation';
import CalendarPeriodSummary from './CalendarPeriodSummary';

type CalendarSidebarProps = {
  className?: string;
  focusedDate: CalendarDate;
  kind: NonNullable<NotePeriodKind>;
  summaryClassName?: string;
};

const VIEWS = [
  { id: 'month', label: 'Month' },
  { id: 'week', label: 'Week' },
  { id: 'day', label: 'Day' },
] as const;

const CalendarSidebar = ({
  className,
  focusedDate,
  kind,
  summaryClassName,
}: CalendarSidebarProps) => {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const firstDayOfWeek = useFirstDayOfWeek();
  const timeZone = getLocalTimeZone();
  const dayNotes = useDayNotes();
  const weekNotes = useWeekNotes();
  const monthNotes = useMonthNotes();
  const occurrences = useFlatOccurrences();
  const [focusedCalendarMonth, setFocusedCalendarMonth] =
    React.useState(focusedDate);

  React.useEffect(() => {
    setFocusedCalendarMonth(focusedDate);
  }, [focusedDate]);

  const viewPaths = React.useMemo(() => {
    const todayDate = today(timeZone);

    const weekAnchor = (date: CalendarDate) => {
      return startOfWeek(date, locale, firstDayOfWeek).add({
        days: firstDayOfWeek === 'sun' ? 4 : 3,
      });
    };

    const weekDate = kind === 'month' ? todayDate : focusedDate;
    const anchor = weekAnchor(weekDate);

    return {
      day: `/calendar/day/${todayDate.year}/${todayDate.month}/${todayDate.day}`,
      month: `/calendar/month/${focusedDate.year}/${focusedDate.month}/1`,
      week: `/calendar/week/${anchor.year}/${anchor.month}/${anchor.day}`,
    };
  }, [focusedDate, kind, locale, firstDayOfWeek, timeZone]);

  const handleCalendarChange = (value: CalendarDate) => {
    navigate(`/calendar/day/${value.year}/${value.month}/${value.day}`);
    setFocusedCalendarMonth(value);
  };

  const { note, occurrenceSummary, startDate } = React.useMemo(() => {
    if (kind === 'day') {
      const dayOccurrences = occurrences.filter((occurrence) => {
        return (
          occurrence.occurredAt.year === focusedDate.year &&
          occurrence.occurredAt.month === focusedDate.month &&
          occurrence.occurredAt.day === focusedDate.day
        );
      });

      return {
        occurrenceSummary: buildOccurrenceSummary(dayOccurrences),
        startDate: focusedDate,
        note: dayNotes.find((note) => {
          return note.periodDate === focusedDate.toString();
        }),
      };
    }

    if (kind === 'week') {
      const weekStart = startOfWeek(focusedDate, locale, firstDayOfWeek);
      const weekEnd = endOfWeek(focusedDate, locale, firstDayOfWeek);
      const weekOccurrences = occurrences.filter((occurrence) => {
        const date = toCalendarDate(occurrence.occurredAt);

        return date.compare(weekStart) >= 0 && date.compare(weekEnd) <= 0;
      });

      return {
        occurrenceSummary: buildOccurrenceSummary(weekOccurrences),
        startDate: weekStart,
        note: weekNotes.find((note) => {
          return note.periodDate === weekStart.toString();
        }),
      };
    }

    const monthStart = startOfMonth(focusedDate);
    const monthEnd = endOfMonth(focusedDate);
    const monthOccurrences = occurrences.filter((occurrence) => {
      const date = toCalendarDate(occurrence.occurredAt);

      return date.compare(monthStart) >= 0 && date.compare(monthEnd) <= 0;
    });

    return {
      occurrenceSummary: buildOccurrenceSummary(monthOccurrences),
      startDate: monthStart,
      note: monthNotes.find((note) => {
        return note.periodDate === monthStart.toString();
      }),
    };
  }, [
    kind,
    dayNotes,
    weekNotes,
    monthNotes,
    occurrences,
    focusedDate,
    locale,
    firstDayOfWeek,
  ]);

  const metricTotals = React.useMemo(() => {
    return buildMetricTotals(occurrenceSummary);
  }, [occurrenceSummary]);

  return (
    <aside className={cn('shrink-0 flex-col overflow-y-auto', className)}>
      <ButtonGroup fullWidth>
        {VIEWS.map((view, index) => {
          return (
            <CustomButton
              key={view.id}
              className="flex-1"
              href={viewPaths[view.id]}
              aria-label={`Switch to ${kind} view`}
              variant={kind === view.id ? 'primary' : 'tertiary'}
            >
              {index > 0 && <ButtonGroup.Separator />}
              {view.label}
            </CustomButton>
          );
        })}
      </ButtonGroup>
      <CalendarNavigation focusedDate={focusedDate} />
      {kind === 'day' && (
        <Calendar
          value={focusedDate}
          onChange={handleCalendarChange}
          aria-label="Focused date calendar"
          focusedValue={focusedCalendarMonth}
          onFocusChange={setFocusedCalendarMonth}
          defaultValue={today(getLocalTimeZone())}
        >
          <Calendar.Header>
            <Calendar.Heading />
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => {
                return <Calendar.HeaderCell>{day}</Calendar.HeaderCell>;
              }}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {(date) => {
                return <Calendar.Cell date={date} />;
              }}
            </Calendar.GridBody>
          </Calendar.Grid>
        </Calendar>
      )}
      <CalendarFilters />
      <CalendarPeriodSummary
        kind={kind}
        note={note}
        startDate={startDate}
        metricTotals={metricTotals}
        className={summaryClassName}
        occurrenceSummary={occurrenceSummary}
      />
    </aside>
  );
};

export default CalendarSidebar;
