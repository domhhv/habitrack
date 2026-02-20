import { Button, Slider, RangeCalendar } from '@heroui/react';
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
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { useLocale } from 'react-aria';

import { useScreenWidth } from '@hooks';
import { useProfile, useNoteDrawerState, useNoteDrawerActions } from '@stores';

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
  const profile = useProfile();
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
    <AnimatePresence mode="wait">
      {isShown && (
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
                  {periodKind === 'month' && <CalendarDotsIcon size={20} />}
                </div>
              );
            }}
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
                      profile?.firstDayOfWeek
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
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              isIconOnly
              variant="flat"
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
              firstDayOfWeek={profile?.firstDayOfWeek}
              value={{
                end: endRange,
                start: periodDate,
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
              variant="flat"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotePeriodPicker;
