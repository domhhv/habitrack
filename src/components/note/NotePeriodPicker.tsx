import { cn, ButtonGroup, Description, RangeCalendar } from '@heroui/react';
import {
  startOfWeek,
  isSameMonth,
  startOfMonth,
  type CalendarDate,
} from '@internationalized/date';
import {
  SunIcon,
  CaretLeftIcon,
  CaretRightIcon,
  NumberSevenIcon,
  CalendarDotsIcon,
} from '@phosphor-icons/react';
import React from 'react';
import { useLocale } from 'react-aria';

import { CustomButton } from '@components';
import { useFirstDayOfWeek } from '@hooks';
import { useNoteDrawerState, useNoteDrawerActions } from '@stores';

type NotePeriodPickerProps = {
  endRange: CalendarDate;
  isShown: boolean;
  onBeforeChange?: () => Promise<boolean> | boolean;
};

const NotePeriodPicker = ({
  endRange,
  isShown,
  onBeforeChange,
}: NotePeriodPickerProps) => {
  const firstDayOfWeek = useFirstDayOfWeek();
  const { locale } = useLocale();
  const { periodDate, periodKind } = useNoteDrawerState();
  const { setPeriodDate, setPeriodKind } = useNoteDrawerActions();

  const handleChange = async (changeFn: () => void) => {
    if (onBeforeChange) {
      const canProceed = await onBeforeChange();

      if (!canProceed) {
        return;
      }
    }

    changeFn();
  };

  return (
    <div
      className={cn(
        'mt-2 hidden flex-col items-center justify-start gap-4 max-[446px]:gap-4',
        isShown && 'flex'
      )}
    >
      <ButtonGroup size="sm">
        <CustomButton
          variant={periodKind === 'month' ? 'primary' : 'secondary'}
          onPress={() => {
            void handleChange(() => {
              setPeriodDate(startOfMonth(periodDate));
              setPeriodKind('month');
            });
          }}
        >
          <CalendarDotsIcon size={20} />
          Month
        </CustomButton>
        <CustomButton
          variant={periodKind === 'week' ? 'primary' : 'secondary'}
          onPress={() => {
            void handleChange(() => {
              const nextPeriodDate = startOfWeek(
                periodDate,
                locale,
                firstDayOfWeek
              );
              setPeriodDate(
                isSameMonth(nextPeriodDate, periodDate)
                  ? nextPeriodDate
                  : nextPeriodDate.add({ weeks: 1 })
              );
              setPeriodKind('week');
            });
          }}
        >
          <ButtonGroup.Separator />
          <NumberSevenIcon size={20} />
          Week
        </CustomButton>
        <CustomButton
          variant={periodKind === 'day' ? 'primary' : 'secondary'}
          onPress={() => {
            void handleChange(() => {
              const nextPeriodDate =
                periodKind === 'month'
                  ? startOfMonth(periodDate)
                  : startOfWeek(periodDate, locale, firstDayOfWeek);
              setPeriodDate(nextPeriodDate);
              setPeriodKind('day');
            });
          }}
        >
          <ButtonGroup.Separator />
          <SunIcon size={20} />
          Day
        </CustomButton>
      </ButtonGroup>
      <div className="flex gap-1">
        <CustomButton
          size="sm"
          isIconOnly
          variant="outline"
          className="h-auto w-5! min-w-auto self-stretch"
          onPress={() => {
            void handleChange(() => {
              switch (periodKind) {
                case 'day':
                  return setPeriodDate(periodDate.subtract({ days: 1 }));

                case 'week':
                  return setPeriodDate(periodDate.subtract({ weeks: 1 }));

                case 'month':
                  return setPeriodDate(periodDate.subtract({ months: 1 }));
              }
            });
          }}
        >
          <CaretLeftIcon />
        </CustomButton>
        <RangeCalendar
          isReadOnly
          focusedValue={periodDate}
          firstDayOfWeek={firstDayOfWeek}
          aria-label="Note period picker calendar"
          isDateUnavailable={() => {
            return false;
          }}
          value={{
            end: endRange,
            start: periodDate,
          }}
        >
          <RangeCalendar.Header className="text-center">
            <RangeCalendar.Heading />
          </RangeCalendar.Header>
          <RangeCalendar.Grid>
            <RangeCalendar.GridHeader>
              {(day) => {
                return (
                  <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>
                );
              }}
            </RangeCalendar.GridHeader>
            <RangeCalendar.GridBody>
              {(date) => {
                return <RangeCalendar.Cell date={date} />;
              }}
            </RangeCalendar.GridBody>
          </RangeCalendar.Grid>
        </RangeCalendar>
        <CustomButton
          size="sm"
          isIconOnly
          variant="outline"
          className="h-auto w-5! min-w-auto self-stretch"
          onPress={() => {
            void handleChange(() => {
              switch (periodKind) {
                case 'day':
                  return setPeriodDate(periodDate.add({ days: 1 }));

                case 'week':
                  return setPeriodDate(periodDate.add({ weeks: 1 }));

                case 'month':
                  return setPeriodDate(periodDate.add({ months: 1 }));
              }
            });
          }}
        >
          <CaretRightIcon />
        </CustomButton>
      </div>
      <Description className="text-center">Calendar is read-only</Description>
    </div>
  );
};

export default NotePeriodPicker;
