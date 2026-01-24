import { cn, ScrollShadow } from '@heroui/react';
import React from 'react';

import type { Occurrence } from '@models';
import { useOccurrenceDrawerActions } from '@stores';

import OccurrenceListItem from './OccurrenceListItem';

type OccurrenceListProps = {
  hasChips: boolean;
  hasOccurrencesWithAndWithoutTime: boolean;
  hasOccurrencesWithoutTime: boolean;
  hasOccurrencesWithTime: boolean;
  occurrenceIdBeingRemoved: Occurrence['id'];
  occurrencesWithoutTime: Occurrence[];
  occurrencesWithTime: Occurrence[];
  onRemove: (o: Occurrence) => void;
};

const OccurrenceList = ({
  hasChips,
  hasOccurrencesWithAndWithoutTime,
  hasOccurrencesWithoutTime,
  hasOccurrencesWithTime,
  occurrenceIdBeingRemoved,
  occurrencesWithoutTime,
  occurrencesWithTime,
  onRemove,
}: OccurrenceListProps) => {
  const { openOccurrenceDrawer } = useOccurrenceDrawerActions();

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
                  isBeingRemoved={occurrenceIdBeingRemoved === o.id}
                  onRemove={() => {
                    void onRemove(o);
                  }}
                  onEdit={() => {
                    openOccurrenceDrawer({ occurrenceToEdit: o });
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
                    isBeingRemoved={occurrenceIdBeingRemoved === o.id}
                    onRemove={() => {
                      void onRemove(o);
                    }}
                    onEdit={() => {
                      openOccurrenceDrawer({ occurrenceToEdit: o });
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
