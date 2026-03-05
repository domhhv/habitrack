import { cn, Chip } from '@heroui/react';
import React from 'react';

import type { Trait } from '@models';

type TraitChipProps = {
  className?: string;
  trait: Pick<Trait, 'name' | 'color'> | null;
};

const TraitChip = ({ className, trait }: TraitChipProps) => {
  return (
    <Chip
      size="sm"
      variant="faded"
      color="secondary"
      className={cn('h-5 border', className)}
    >
      <div className="flex items-center gap-1 font-semibold">
        <span
          role="habit-trait-chip-color-indicator"
          className="mr-0.5 inline-block h-1 w-1 rounded-full"
          style={{
            backgroundColor: trait?.color || 'black',
          }}
        />
        <p role="habit-trait-chip-name">{trait?.name || 'No trait'}</p>
      </div>
    </Chip>
  );
};

export default TraitChip;
