import { cn, Badge, Tooltip } from '@heroui/react';
import { toCalendarDate } from '@internationalized/date';
import { NoteIcon, CameraIcon } from '@phosphor-icons/react';
import React from 'react';

import { useScreenWidth, useCalendarData, useKeyboardShortcut } from '@hooks';
import type { Occurrence } from '@models';
import { StorageBuckets } from '@models';
import { getPublicUrl } from '@services';
import { useOccurrenceDrawerActions } from '@stores';
import { getReadableTextColor } from '@utils';

export type OccurrenceChipProps = {
  colorOverride?: string;
  hasCounter?: boolean;
  hasMargin?: boolean;
  hasTooltip?: boolean;
  isClickable?: boolean;
  isCompact?: boolean;
  isHabitNameShown?: boolean;
  occurrences: Occurrence[];
};

const OccurrenceChip = ({
  colorOverride,
  hasCounter = true,
  hasMargin = true,
  hasTooltip = true,
  isClickable = true,
  isCompact = false,
  isHabitNameShown = false,
  occurrences,
}: OccurrenceChipProps) => {
  const { notesByOccurrenceId: notes } = useCalendarData();
  const { openOccurrenceDrawer } = useOccurrenceDrawerActions();
  const [occurrence] = occurrences;
  const { habit, habitId } = occurrence;
  const { iconPath, name: habitName, trait } = habit || {};
  const { color: traitColor } = trait || {};
  const { screenWidth } = useScreenWidth();
  const [isFocused, setIsFocused] = React.useState(false);
  const isPending = occurrences.every((o) => {
    return o.isPending;
  });
  const isInteractive = isClickable && !isPending;

  const handleClick = () => {
    openOccurrenceDrawer({
      dayToDisplay: toCalendarDate(occurrence.occurredAt),
      habitIdToDisplay: habitId,
    });
  };

  useKeyboardShortcut(['Enter', ' '], () => {
    if (isInteractive && isFocused) {
      handleClick();
    }
  });

  const hasNote = occurrences.some((o) => {
    return !!notes[o.id];
  });
  const hasPhoto = occurrences.some((o) => {
    return o.photoPaths?.length;
  });

  if (isCompact) {
    const badgeColor = colorOverride || traitColor;

    return (
      <div
        {...(isInteractive && {
          onClick: handleClick,
          role: 'button',
          tabIndex: 0,
        })}
        onFocus={() => {
          return setIsFocused(true);
        }}
        onBlur={() => {
          return setIsFocused(false);
        }}
        className={cn(
          'relative flex size-4 items-center justify-center',
          isPending && 'opacity-60'
        )}
      >
        <img
          className="size-3.5"
          alt={`${habitName} icon`}
          src={getPublicUrl(StorageBuckets.HABIT_ICONS, iconPath)}
        />
        <span
          style={{
            backgroundColor: badgeColor,
            color: badgeColor ? getReadableTextColor(badgeColor) : undefined,
          }}
          className={cn(
            'bg-accent absolute -right-0.5 -bottom-1 flex items-center justify-center rounded-full font-bold ring-1 ring-white dark:ring-black',
            occurrences.length > 1
              ? 'h-2.5 min-w-2.5 px-px text-[8px] leading-none'
              : 'size-1.5'
          )}
        >
          {occurrences.length > 1 && occurrences.length}
        </span>
        {hasNote && (
          <NoteIcon
            size={8}
            weight="fill"
            className="absolute -top-1 -right-0.5"
          />
        )}
        {hasPhoto && (
          <CameraIcon
            size={8}
            weight="fill"
            className="absolute -top-1 -left-0.5"
          />
        )}
      </div>
    );
  }

  let chip = (
    <div
      {...(isInteractive && {
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
        'relative rounded-2xl border-2 bg-white p-1.5 dark:bg-black',
        isPending && 'opacity-60',
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
      <Badge.Anchor>
        {chip}
        <Badge
          size="sm"
          color="accent"
          variant="primary"
          placement="bottom-right"
        >
          {occurrences.length}
        </Badge>
      </Badge.Anchor>
    );
  }

  if (hasNote) {
    chip = (
      <Badge.Anchor>
        {chip}
        <Badge
          size="sm"
          placement="top-right"
          className="border-none bg-transparent"
        >
          <NoteIcon size={14} weight="fill" />
        </Badge>
      </Badge.Anchor>
    );
  }

  if (hasPhoto) {
    chip = (
      <Badge.Anchor>
        {chip}
        <Badge
          size="sm"
          placement="top-left"
          className="border-none bg-transparent"
        >
          <CameraIcon size={14} weight="fill" />
        </Badge>
      </Badge.Anchor>
    );
  }

  return chip;
};

export default OccurrenceChip;
