import { cn, Label, Button, Slider, RangeCalendar } from '@heroui/react';
import {
  startOfWeek,
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

import { useScreenWidth, useFirstDayOfWeek } from '@hooks';
import { useNoteDrawerState, useNoteDrawerActions } from '@stores';

type NotePeriodPickerProps = {
  endRange: CalendarDate;
  isShown: boolean;
  onBeforeChange?: () => Promise<boolean> | boolean;
};

const periodIcons: Record<string, React.ReactNode> = {
  day: <SunIcon size={20} />,
  month: <CalendarDotsIcon size={20} />,
  week: <NumberSevenIcon size={20} />,
};

const NotePeriodPicker = ({
  endRange,
  isShown,
  onBeforeChange,
}: NotePeriodPickerProps) => {
  const firstDayOfWeek = useFirstDayOfWeek();
  const { locale } = useLocale();
  const { screenWidth } = useScreenWidth();
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
        'hidden justify-between gap-2 max-[446px]:flex-col max-[446px]:items-center max-[446px]:justify-start max-[446px]:gap-4',
        isShown && 'flex'
      )}
    >
      <Slider
        step={1}
        minValue={1}
        maxValue={3}
        value={['day', 'week', 'month'].indexOf(periodKind) + 1}
        orientation={screenWidth > 445 ? 'vertical' : 'horizontal'}
        onChange={(value) => {
          const nextValue = Array.isArray(value) ? value[0] : value;

          void handleChange(() => {
            switch (nextValue) {
              case 1:
                setPeriodDate(periodDate);
                setPeriodKind('day');
                break;

              case 2: {
                const weekStart = startOfWeek(
                  periodDate,
                  locale,
                  firstDayOfWeek
                );
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
          });
        }}
      >
        <Label className="sr-only">Period type</Label>
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb>
            <div className="bg-primary-600 flex h-8 w-8 items-center justify-center rounded-full text-white">
              {periodIcons[periodKind]}
            </div>
          </Slider.Thumb>
        </Slider.Track>
      </Slider>
      <div className="flex gap-1">
        <Button
          size="sm"
          isIconOnly
          variant="secondary"
          className="h-full w-5! min-w-auto"
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
        </Button>
        <RangeCalendar
          isReadOnly
          focusedValue={periodDate}
          firstDayOfWeek={firstDayOfWeek}
          className="cursor-default [&_span]:cursor-default!"
          value={{
            end: endRange,
            start: periodDate,
          }}
        />
        <Button
          size="sm"
          isIconOnly
          variant="secondary"
          className="h-full w-5! min-w-auto"
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
        </Button>
      </div>
    </div>
  );
};

export default NotePeriodPicker;
