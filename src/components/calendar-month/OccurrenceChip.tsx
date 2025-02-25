import { Badge, Button, Tooltip } from '@heroui/react';
import { useScreenWidth } from '@hooks';
import type { Occurrence } from '@models';
import { Note, PencilSimple, TrashSimple } from '@phosphor-icons/react';
import { useNotesStore } from '@stores';
import { getHabitIconUrl } from '@utils';
import clsx from 'clsx';
import { format } from 'date-fns';
import React from 'react';

export type OccurrenceChipProps = {
  interactable?: boolean;
  occurrences: Occurrence[];
  onDelete?: (occurrenceId: number) => void;
  onEdit?: (occurrenceId: number) => void;
  colorOverride?: string;
};

const OccurrenceChip = ({
  interactable = true,
  occurrences,
  onDelete,
  onEdit,
  colorOverride,
}: OccurrenceChipProps) => {
  const occurrenceIds = occurrences.map((o) => o.id);
  const [occurrence] = occurrences;
  const { habit } = occurrence;
  const { notes } = useNotesStore();
  const { name: habitName, iconPath, trait } = habit || {};
  const { color: traitColor } = trait || {};
  const iconUrl = getHabitIconUrl(iconPath);
  const occurrenceTimes = occurrences
    .map((o) => ({
      occurrenceId: o.id,
      time: format(new Date(o.timestamp), 'p'),
    }))
    .sort((a, b) => a.time.localeCompare(b.time));
  const occurrenceNotes = notes.filter(
    (n) => n.occurrenceId && occurrenceIds.includes(n.occurrenceId)
  );
  const { screenWidth } = useScreenWidth();

  const chipStyle = {
    borderColor: colorOverride || traitColor,
  };

  const tooltipContent = (
    <div className="max-h-96 space-y-2 overflow-x-hidden overflow-y-visible p-1">
      <span className="font-bold">{habitName}</span>
      <ul className="space-y-2 italic">
        {occurrenceTimes.map((t) => {
          const note = occurrenceNotes.find(
            (n) => n.occurrenceId === t.occurrenceId
          );
          return (
            <li
              key={t.occurrenceId}
              className="mb-2 flex items-start justify-between gap-4 border-b border-neutral-500 py-2"
            >
              <div className="max-w-48">
                <span className="font-semibold">{t.time}</span>
                {!!note && (
                  <span className="font-normal">: {note.content}</span>
                )}
              </div>
              <div className="flex items-center">
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  color="secondary"
                  onPress={() => onEdit?.(t.occurrenceId)}
                  className="h-6 w-6 min-w-0 rounded-lg"
                >
                  <PencilSimple
                    size={14}
                    fill="bold"
                    className="dark:fill-white"
                  />
                </Button>
                <Button
                  isIconOnly
                  variant="light"
                  color="danger"
                  onPress={() => onDelete?.(t.occurrenceId)}
                  role="habit-chip-delete-button"
                  className="h-6 w-6 min-w-0 rounded-lg"
                >
                  <TrashSimple
                    size={14}
                    fill="bold"
                    className="dark:fill-white"
                  />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  let chipTooltip = (
    <Tooltip
      isDisabled={!habitName || !interactable}
      content={tooltipContent}
      radius="sm"
      classNames={{
        content: 'px-2 py-1.5',
      }}
      delay={0}
      closeDelay={100}
    >
      <div
        style={chipStyle}
        className={clsx(
          'relative mb-0 min-w-8 rounded-md border-2 bg-slate-100 p-1.5 dark:bg-slate-800 md:mb-1 md:mr-1',
          screenWidth < 400 && 'p-1'
        )}
        role="habit-chip"
      >
        <img
          src={iconUrl}
          alt={`${habitName} icon`}
          className={clsx('h-4 w-4', screenWidth < 400 && 'h-3 w-3')}
        />
      </div>
    </Tooltip>
  );

  if (occurrences.length > 1) {
    chipTooltip = (
      <Badge
        size="sm"
        content={occurrences.length}
        variant="solid"
        placement="bottom-right"
        color="primary"
      >
        {chipTooltip}
      </Badge>
    );
  }

  if (occurrenceNotes.length) {
    chipTooltip = (
      <Badge
        size="sm"
        content={<Note weight="fill" size={14} />}
        placement="top-right"
        className="right-1 top-1 border-none bg-transparent"
      >
        {chipTooltip}
      </Badge>
    );
  }

  return chipTooltip;
};

export default OccurrenceChip;
