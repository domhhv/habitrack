import { cn, Badge, Tooltip } from '@heroui/react';
import {
  parseAbsolute,
  toCalendarDate,
  getLocalTimeZone,
} from '@internationalized/date';
import { NoteIcon, CameraIcon } from '@phosphor-icons/react';
import React from 'react';

import { useScreenWidth, useKeyboardShortcut } from '@hooks';
import type { Occurrence } from '@models';
import { StorageBuckets } from '@models';
import { getPublicUrl } from '@services';
import { useOccurrenceDrawerActions } from '@stores';

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
  const { openOccurrenceDrawer } = useOccurrenceDrawerActions();
  const [occurrence] = occurrences;
  const { habit, habitId } = occurrence;
  const { iconPath, name: habitName, trait } = habit || {};
  const { color: traitColor } = trait || {};
  const { screenWidth } = useScreenWidth();
  const timeZone = getLocalTimeZone();
  const [isFocused, setIsFocused] = React.useState(false);

  const handleClick = () => {
    openOccurrenceDrawer({
      habitIdToDisplay: habitId,
      dayToDisplay: toCalendarDate(
        parseAbsolute(new Date(occurrence.timestamp).toISOString(), timeZone)
      ),
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
      <Tooltip
        radius="sm"
        closeDelay={0}
        content={habitName}
        classNames={{
          content: 'px-2 py-1.5',
        }}
      >
        {chip}
      </Tooltip>
    );
  }

  if (hasCounter && occurrences.length > 1) {
    chip = (
      <Badge
        size="sm"
        variant="solid"
        color="primary"
        placement="bottom-right"
        content={occurrences.length}
      >
        {chip}
      </Badge>
    );
  }

  if (
    occurrences.some((o) => {
      return o.note;
    })
  ) {
    chip = (
      <Badge
        size="sm"
        placement="top-right"
        content={<NoteIcon size={14} weight="fill" />}
        className="top-1 right-1 border-none bg-transparent"
      >
        {chip}
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
        content={<CameraIcon size={14} weight="fill" />}
        className="top-1 right-1 border-none bg-transparent"
      >
        {chip}
      </Badge>
    );
  }

  return chip;
};

export default OccurrenceChip;
