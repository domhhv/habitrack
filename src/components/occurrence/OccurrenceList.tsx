import { cn, ScrollShadow } from '@heroui/react';
import React from 'react';

import type { Occurrence } from '@models';

import OccurrenceListItem from './OccurrenceListItem';

type OccurrenceListProps = {
  hasChips: boolean;
  hasOccurrencesWithAndWithoutTime: boolean;
  hasOccurrencesWithoutTime: boolean;
  hasOccurrencesWithTime: boolean;
  occurrencesWithoutTime: Occurrence[];
  occurrencesWithTime: Occurrence[];
  onEdit: (o: Occurrence) => void;
  onRemove: (o: Occurrence) => void;
};

const OccurrenceList = ({
  hasChips,
  hasOccurrencesWithAndWithoutTime,
  hasOccurrencesWithoutTime,
  hasOccurrencesWithTime,
  occurrencesWithoutTime,
  occurrencesWithTime,
  onEdit,
  onRemove,
}: OccurrenceListProps) => {
  return (
    <ScrollShadow
      className={cn(
        'max-h-full px-1',
        hasOccurrencesWithAndWithoutTime && 'space-y-4'
      )}
    >
      {hasOccurrencesWithoutTime && (
        <div>
          {hasOccurrencesWithAndWithoutTime && (
            <p className="mb-1">Without time</p>
          )}
          <ol className="list-decimal pl-6">
            {occurrencesWithoutTime.map((o) => {
              return (
                <OccurrenceListItem
                  key={o.id}
                  occurrence={o}
                  hasChip={hasChips}
                  onEdit={() => {
                    onEdit(o);
                  }}
                  onRemove={() => {
                    void onRemove(o);
                  }}
                />
              );
            })}
          </ol>
        </div>
      )}
      {hasOccurrencesWithTime && (
        <div>
          {hasOccurrencesWithAndWithoutTime && (
            <p className="mb-1">With time</p>
          )}
          <ul>
            {occurrencesWithTime
              .toSorted((a, b) => {
                return a.timestamp - b.timestamp;
              })
              .map((o) => {
                return (
                  <OccurrenceListItem
                    key={o.id}
                    occurrence={o}
                    hasChip={hasChips}
                    onEdit={() => {
                      onEdit(o);
                    }}
                    onRemove={() => {
                      void onRemove(o);
                    }}
                  />
                );
              })}
          </ul>
        </div>
      )}
    </ScrollShadow>
  );
};

export default OccurrenceList;
