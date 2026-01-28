import { useDisclosure, type SelectedItems } from '@heroui/react';
import {
  Select,
  Tooltip,
  Checkbox,
  SelectItem,
  SelectSection,
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import groupBy from 'lodash.groupby';
import React from 'react';

import { TraitChip, CrossPlatformHorizontalScroll } from '@components';
import { useScreenWidth } from '@hooks';
import type { Habit, Trait } from '@models';
import { StorageBuckets } from '@models';
import { getPublicUrl } from '@services';
import {
  useUser,
  useHabits,
  useTraits,
  useCalendarFilters,
  useCalendarFiltersChange,
} from '@stores';

const MonthCalendarFilters = () => {
  const habits = useHabits();
  const traits = useTraits();
  const filters = useCalendarFilters();
  const { user } = useUser();
  const { isDesktop } = useScreenWidth();
  const changeCalendarFilters = useCalendarFiltersChange();
  const {
    isOpen: isHabitsFilterSelectOpen,
    onOpenChange: onHabitsFilterSelectOpenChange,
  } = useDisclosure();
  const {
    isOpen: isTraitsFilterSelectOpen,
    onOpenChange: onTraitsFilterSelectOpenChange,
  } = useDisclosure();

  const areAllHabitsSelected = React.useMemo(() => {
    if (filters.habitIds.length === 1 && filters.habitIds.includes('')) {
      return false;
    }

    return filters.habitIds.length === Object.keys(habits).length;
  }, [filters.habitIds, habits]);

  const areAllTraitsSelected = React.useMemo(() => {
    if (filters.traitIds.length === 1 && filters.traitIds.includes('')) {
      return false;
    }

    return filters.traitIds.length === Object.keys(traits).length;
  }, [filters.traitIds, traits]);

  const habitsByTraitName = React.useMemo(() => {
    return groupBy(Object.values(habits), (habit) => {
      return habit.trait?.name || 'Unknown';
    });
  }, [habits]);

  const handleHabitsFilterChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = (event) => {
    if (event.target.value.includes('toggle-all')) {
      if (areAllHabitsSelected) {
        changeCalendarFilters({
          ...filters,
          habitIds: [''],
        });

        return;
      }

      const allHabitIds = Object.keys(habits).filter((id) => {
        return id !== '';
      });

      changeCalendarFilters({
        ...filters,
        habitIds: allHabitIds,
      });

      return;
    }

    changeCalendarFilters({
      ...filters,
      habitIds: event.target.value.split(','),
    });
  };

  const handleTraitsFilterChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = (event) => {
    if (event.target.value.includes('toggle-all')) {
      if (areAllTraitsSelected) {
        changeCalendarFilters({
          ...filters,
          traitIds: [''],
        });

        return;
      }

      const allTraitIds = Object.keys(traits).filter((id) => {
        return id !== '';
      });

      changeCalendarFilters({
        ...filters,
        traitIds: allTraitIds,
      });

      return;
    }

    changeCalendarFilters({
      ...filters,
      traitIds: event.target.value.split(','),
    });
  };

  return (
    <AnimatePresence mode="wait">
      {(isDesktop || filters.isShownOnMobile) && user && (
        <motion.div
          initial={{
            height: 0,
            opacity: 0,
          }}
          className="flex flex-col items-stretch justify-end gap-2 min-[450px]:flex-row lg:justify-between"
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
            height: 'auto',
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
          <Select
            size="sm"
            radius="sm"
            color="secondary"
            variant="bordered"
            selectionMode="multiple"
            className="w-full md:w-50"
            placeholder="Filter by habits"
            selectedKeys={filters.habitIds}
            isOpen={isHabitsFilterSelectOpen}
            onChange={handleHabitsFilterChange}
            onOpenChange={onHabitsFilterSelectOpenChange}
            scrollShadowProps={{
              visibility: 'bottom',
            }}
            renderValue={(selectedHabits: SelectedItems<Habit>) => {
              return (
                <CrossPlatformHorizontalScroll className="flex space-x-2">
                  {selectedHabits.map(({ key }) => {
                    if (typeof key !== 'string' || !habits[key]) {
                      return null;
                    }

                    const { iconPath, id, name } = habits[key];

                    return (
                      <Tooltip key={id} closeDelay={0} content={name}>
                        <img
                          className="h-4 w-4"
                          alt={`${name} icon`}
                          src={getPublicUrl(
                            StorageBuckets.HABIT_ICONS,
                            iconPath
                          )}
                        />
                      </Tooltip>
                    );
                  })}
                </CrossPlatformHorizontalScroll>
              );
            }}
          >
            <>
              {!!Object.keys(habits).length && (
                <SelectItem
                  key="toggle-all"
                  className="mb-0.5"
                  textValue="Toggle all"
                >
                  <Checkbox
                    color="secondary"
                    isSelected={areAllHabitsSelected}
                    isIndeterminate={
                      !areAllHabitsSelected && filters.habitIds.some(Boolean)
                    }
                  />
                  <span>
                    {areAllHabitsSelected ? 'Unselect' : 'Select'} all
                  </span>
                </SelectItem>
              )}
              {Object.entries(habitsByTraitName).map(
                ([traitName, habits], index, array) => {
                  if (!habits?.length) {
                    return null;
                  }

                  return (
                    <SelectSection
                      key={traitName}
                      title={traitName}
                      showDivider={index < array.length - 1}
                      classNames={{
                        heading:
                          'flex w-full sticky top-1 z-20 py-1.5 px-2 pl-4 bg-default-100 shadow-small rounded-small',
                      }}
                    >
                      {habits.map((habit) => {
                        return (
                          <SelectItem key={habit.id} textValue={habit.name}>
                            <div className="flex items-center gap-2">
                              <img
                                alt={habit.name}
                                role="habit-icon"
                                className="h-4 w-4"
                                src={getPublicUrl(
                                  StorageBuckets.HABIT_ICONS,
                                  habit.iconPath
                                )}
                              />
                              <span className="truncate">{habit.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectSection>
                  );
                }
              )}
            </>
          </Select>
          <Select
            size="sm"
            radius="sm"
            color="secondary"
            variant="bordered"
            selectionMode="multiple"
            placeholder="Filter by traits"
            selectedKeys={filters.traitIds}
            isOpen={isTraitsFilterSelectOpen}
            onChange={handleTraitsFilterChange}
            onOpenChange={onTraitsFilterSelectOpenChange}
            className="w-full min-[450px]:w-1/2 md:w-[250px]"
            renderValue={(selectedTraits: SelectedItems<Trait>) => {
              return (
                <CrossPlatformHorizontalScroll className="flex space-x-2">
                  {selectedTraits.map(({ key }) => {
                    if (typeof key !== 'string' || !traits[key]) {
                      return null;
                    }

                    const { color, id, name } = traits[key];

                    return <TraitChip key={id} trait={{ color, name }} />;
                  })}
                </CrossPlatformHorizontalScroll>
              );
            }}
          >
            <>
              {!!Object.keys(traits).length && (
                <SelectItem
                  key="toggle-all"
                  className="mb-0.5"
                  textValue="Toggle all"
                >
                  <Checkbox
                    color="secondary"
                    isSelected={areAllTraitsSelected}
                    isIndeterminate={
                      !areAllTraitsSelected && filters.traitIds.some(Boolean)
                    }
                  />
                  <span>
                    {areAllTraitsSelected ? 'Unselect' : 'Select'} all
                  </span>
                </SelectItem>
              )}
              <SelectSection title="Filter by traits">
                {Object.values(traits).map((trait) => {
                  return <SelectItem key={trait.id}>{trait.name}</SelectItem>;
                })}
              </SelectSection>
            </>
          </Select>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MonthCalendarFilters;
