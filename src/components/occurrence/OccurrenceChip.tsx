import { cn, Badge, Tooltip } from '@heroui/react';
import { toCalendarDate } from '@internationalized/date';
import { NoteIcon, CameraIcon } from '@phosphor-icons/react';
import React from 'react';

import { useScreenWidth, useKeyboardShortcut } from '@hooks';
import type { Occurrence } from '@models';
import { StorageBuckets } from '@models';
import { getPublicUrl } from '@services';
import { useNotesByOccurrenceId, useOccurrenceDrawerActions } from '@stores';

export type OccurrenceChipProps = {
  colorOverride?: string;
  hasCounter?: boolean;
  hasMargin?: boolean;
  hasTooltip?: boolean;
  isClickable?: boolean;
  isHabitNameShown?: boolean;
  occurrences: Occurrence[];
};

const OccurrenceChip = ({
  colorOverride,
  hasCounter = true,
  hasMargin = true,
  hasTooltip = true,
  isClickable = true,
  isHabitNameShown = false,
  occurrences,
}: OccurrenceChipProps) => {
  const notes = useNotesByOccurrenceId();
  const { openOccurrenceDrawer } = useOccurrenceDrawerActions();
  const [occurrence] = occurrences;
  const { habit, habitId } = occurrence;
  const { iconPath, name: habitName, trait } = habit || {};
  const { color: traitColor } = trait || {};
  const { screenWidth } = useScreenWidth();
  const [isFocused, setIsFocused] = React.useState(false);

  const handleClick = () => {
    openOccurrenceDrawer({
      dayToDisplay: toCalendarDate(occurrence.occurredAt),
      habitIdToDisplay: habitId,
    });
  };

  useKeyboardShortcut(['Enter', ' '], () => {
    if (isClickable && isFocused) {
      handleClick();
    }
  });

  let chip = (
    <div
      {...(isClickable && {
        onClick: handleClick,
        role: 'button',
        tabIndex: 0,
      })}
      style={{ borderColor: colorOverride || traitColor }}
      onFocus={() => {
        return setIsFocused(true);
      }}
      onBlur={() => {
        return setIsFocused(false);
      }}
      className={cn(
        'relative rounded-md border-2 bg-white p-1.5 dark:bg-black',
        isHabitNameShown && 'flex items-center gap-2 px-1 py-0.5',
        hasMargin && 'md:mr-1 md:mb-1',
        screenWidth < 400 && 'p-1'
      )}
    >
      <img
        alt={`${habitName} icon`}
        src={getPublicUrl(StorageBuckets.HABIT_ICONS, iconPath)}
        className={cn('h-4 w-4', screenWidth < 400 && 'h-3 w-3')}
      />
      {isHabitNameShown && <span>{habitName}</span>}
    </div>
  );

  if (hasTooltip) {
    chip = (
      <Tooltip closeDelay={0}>
        <Tooltip.Trigger>{chip}</Tooltip.Trigger>
        <Tooltip.Content className="px-2 py-1.5">{habitName}</Tooltip.Content>
      </Tooltip>
    );
  }

  if (hasCounter && occurrences.length > 1) {
    chip = (
      <Badge
        size="sm"
        color="accent"
        variant="primary"
        placement="bottom-right"
      >
        <Badge.Anchor>{chip}</Badge.Anchor>
        <Badge.Label>{occurrences.length}</Badge.Label>
      </Badge>
    );
  }

  if (
    occurrences.some((o) => {
      return !!notes[o.id];
    })
  ) {
    chip = (
      <Badge
        size="sm"
        placement="top-right"
        className="top-1 right-1 border-none bg-transparent"
      >
        <Badge.Anchor>{chip}</Badge.Anchor>
        <Badge.Label>
          <NoteIcon size={14} weight="fill" />
        </Badge.Label>
      </Badge>
    );
  }

  if (
    occurrences.some((o) => {
      return o.photoPaths?.length;
    })
  ) {
    chip = (
      <Badge
        size="sm"
        placement="top-left"
        className="top-1 right-1 border-none bg-transparent"
      >
        <Badge.Anchor>{chip}</Badge.Anchor>
        <Badge.Label>
          <CameraIcon size={14} weight="fill" />
        </Badge.Label>
      </Badge>
    );
  }

  return chip;
};

export default OccurrenceChip;
