import {
  cn,
  Label,
  Header,
  Select,
  ListBox,
  Tooltip,
  Checkbox,
  Separator,
  useOverlayState,
} from '@heroui/react';
import groupBy from 'lodash.groupby';
import React from 'react';

import { TraitChip } from '@components';
import { useScreenWidth } from '@hooks';
import { StorageBuckets } from '@models';
import { getPublicUrl } from '@services';
import {
  useUser,
  useHabits,
  useTraits,
  useCalendarFilters,
  useCalendarFiltersChange,
} from '@stores';

const CalendarFilters = () => {
  const habits = useHabits();
  const traits = useTraits();
  const filters = useCalendarFilters();
  const user = useUser();
  const { isDesktop } = useScreenWidth();
  const changeCalendarFilters = useCalendarFiltersChange();
  const habitsFilterSelectState = useOverlayState();
  const traitsFilterSelectState = useOverlayState();

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

  const handleHabitsFilterChange = (value: React.Key[]) => {
    const values = value.map(String);

    if (values.includes('toggle-all')) {
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
      habitIds: values,
    });
  };

  const handleTraitsFilterChange = (value: React.Key[]) => {
    const values = value.map(String);

    if (values.includes('toggle-all')) {
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
      traitIds: values,
    });
  };

  const isVisible = (isDesktop || filters.isShownOnMobile) && !!user;

  return (
    <div
      className={cn(
        'hidden max-w-full flex-col items-stretch justify-end gap-2',
        isVisible && 'flex'
      )}
    >
      <Select
        fullWidth
        variant="secondary"
        value={filters.habitIds}
        selectionMode="multiple"
        placeholder="Filter by habits"
        onChange={handleHabitsFilterChange}
        isOpen={habitsFilterSelectState.isOpen}
        onOpenChange={habitsFilterSelectState.setOpen}
      >
        <Label>Filter by habits</Label>
        <Select.Trigger>
          <Select.Value className="scrollbar-hide flex min-w-0 items-center gap-2 overflow-x-auto">
            {({ defaultChildren, isPlaceholder, state }) => {
              if (isPlaceholder || state.selectedItems.length === 0) {
                return defaultChildren;
              }

              const selectedItem = Object.values(habits).find((habit) => {
                return habit.id === state.selectedItems[0]?.key;
              });

              if (!selectedItem) {
                return defaultChildren;
              }

              return (
                <>
                  {state.selectedItems.map(({ key }) => {
                    if (typeof key !== 'string' || !habits[key]) {
                      return null;
                    }

                    const { iconPath, id, name } = habits[key];

                    return (
                      <Tooltip key={id} delay={0} closeDelay={0}>
                        <Tooltip.Trigger className="block h-4 w-4 shrink-0">
                          <img
                            className="h-4 w-4"
                            alt={`${name} icon`}
                            src={getPublicUrl(
                              StorageBuckets.HABIT_ICONS,
                              iconPath
                            )}
                          />
                        </Tooltip.Trigger>
                        <Tooltip.Content>{name}</Tooltip.Content>
                      </Tooltip>
                    );
                  })}
                </>
              );
            }}
          </Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {!!Object.keys(habits).length && (
              <ListBox.Item
                id="toggle-all"
                className="mb-0.5"
                textValue="Toggle all"
              >
                <Checkbox
                  variant="secondary"
                  isSelected={areAllHabitsSelected}
                  isIndeterminate={
                    !areAllHabitsSelected && filters.habitIds.some(Boolean)
                  }
                >
                  <Checkbox.Content>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Label>
                      {areAllHabitsSelected ? 'Unselect' : 'Select'} all
                    </Label>
                  </Checkbox.Content>
                </Checkbox>
              </ListBox.Item>
            )}
            {Object.entries(habitsByTraitName).map(
              ([traitName, traitHabits], index, array) => {
                if (!traitHabits?.length) {
                  return null;
                }

                return (
                  <React.Fragment key={traitName}>
                    <ListBox.Section>
                      <Header className="bg-background text-background-inverse shadow-small rounded-small sticky top-1 z-20 flex w-full rounded-3xl px-2 py-1.5 pl-4">
                        {traitName}
                      </Header>
                      {traitHabits.map((habit) => {
                        return (
                          <ListBox.Item
                            id={habit.id}
                            key={habit.id}
                            textValue={habit.name}
                          >
                            <div className="flex items-center gap-2">
                              <img
                                alt={habit.name}
                                className="h-4 w-4"
                                src={getPublicUrl(
                                  StorageBuckets.HABIT_ICONS,
                                  habit.iconPath
                                )}
                              />
                              <span className="truncate">{habit.name}</span>
                            </div>
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        );
                      })}
                    </ListBox.Section>
                    {index < array.length - 1 && <Separator />}
                  </React.Fragment>
                );
              }
            )}
          </ListBox>
        </Select.Popover>
      </Select>
      <Select
        fullWidth
        variant="secondary"
        value={filters.traitIds}
        selectionMode="multiple"
        placeholder="Filter by traits"
        onChange={handleTraitsFilterChange}
        isOpen={traitsFilterSelectState.isOpen}
        onOpenChange={traitsFilterSelectState.setOpen}
      >
        <Label>Filter by traits</Label>
        <Select.Trigger>
          <Select.Value className="scrollbar-hide flex min-w-0 items-center gap-1 overflow-x-auto">
            {({ defaultChildren, isPlaceholder, state }) => {
              if (isPlaceholder || state.selectedItems.length === 0) {
                return defaultChildren;
              }

              return (
                <>
                  {state.selectedItems.map(({ key }) => {
                    if (typeof key !== 'string' || !traits[key]) {
                      return null;
                    }

                    const { color, id, name } = traits[key];

                    return (
                      <TraitChip
                        key={id}
                        color="accent"
                        variant="soft"
                        trait={{ color, name }}
                      />
                    );
                  })}
                </>
              );
            }}
          </Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {!!Object.keys(traits).length && (
              <ListBox.Item
                id="toggle-all"
                className="mb-0.5"
                textValue="Toggle all"
              >
                <Checkbox
                  variant="secondary"
                  isSelected={areAllTraitsSelected}
                  isIndeterminate={
                    !areAllTraitsSelected && filters.traitIds.some(Boolean)
                  }
                >
                  <Checkbox.Content>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Label>
                      {areAllTraitsSelected ? 'Unselect' : 'Select'} all
                    </Label>
                  </Checkbox.Content>
                </Checkbox>
              </ListBox.Item>
            )}
            <ListBox.Section>
              <Header>Filter by traits</Header>
              {Object.values(traits).map((trait) => {
                return (
                  <ListBox.Item
                    id={trait.id}
                    key={trait.id}
                    textValue={trait.name}
                  >
                    {trait.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                );
              })}
            </ListBox.Section>
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
};

export default CalendarFilters;
