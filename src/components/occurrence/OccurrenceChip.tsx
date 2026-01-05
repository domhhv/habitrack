import { cn, Badge, Tooltip } from '@heroui/react';
import { NoteIcon, CameraIcon } from '@phosphor-icons/react';
import React from 'react';

import { useScreenWidth } from '@hooks';
import type { Occurrence } from '@models';
import { StorageBuckets } from '@models';
import { getPublicUrl } from '@services';
import { useOccurrenceDrawerActions } from '@stores';

export type OccurrenceChipProps = {
  colorOverride?: string;
  isInteractable?: boolean;
  occurrences: Occurrence[];
};

const OccurrenceChip = ({
  colorOverride,
  isInteractable = true,
  occurrences,
}: OccurrenceChipProps) => {
  const { openOccurrenceDrawer } = useOccurrenceDrawerActions();
  const [occurrence] = occurrences;
  const { habit } = occurrence;
  const { iconPath, name: habitName, trait } = habit || {};
  const { color: traitColor } = trait || {};
  const { screenWidth } = useScreenWidth();

  let chip = (
    <Tooltip
      radius="sm"
      closeDelay={0}
      content={habitName}
      classNames={{
        content: 'px-2 py-1.5',
      }}
    >
      <div
        role="button"
        style={{ borderColor: colorOverride || traitColor }}
        className={cn(
          'relative mb-0 min-w-8 rounded-md border-2 bg-white p-1.5 md:mr-1 md:mb-1 dark:bg-black',
          screenWidth < 400 && 'p-1'
        )}
        onClick={() => {
          if (isInteractable) {
            openOccurrenceDrawer({
              habitOccurrences: occurrences,
            });
          }
        }}
      >
        <img
          alt={`${habitName} icon`}
          src={getPublicUrl(StorageBuckets.HABIT_ICONS, iconPath)}
          className={cn('h-4 w-4', screenWidth < 400 && 'h-3 w-3')}
        />
      </div>
    </Tooltip>
  );

  if (occurrences.length > 1) {
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
