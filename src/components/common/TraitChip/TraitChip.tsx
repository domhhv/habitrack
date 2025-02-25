import { Chip } from '@heroui/react';
import type { Trait } from '@models';
import React from 'react';

type TraitChipProps = {
  trait: Pick<Trait, 'name' | 'color'> | null;
};

const TraitChip = ({ trait }: TraitChipProps) => {
  return (
    <Chip size="sm" variant="faded" className="h-5 border-1" color="secondary">
      <div className="flex items-center gap-1 font-semibold">
        <span
          className="mr-0.5 inline-block h-1 w-1 rounded-full"
          role="habit-trait-chip-color-indicator"
          style={{
            backgroundColor: trait?.color || 'black',
          }}
        />
        <p role="habit-trait-chip-name">{trait?.name || 'Unknown trait'}</p>
      </div>
    </Chip>
  );
};

export default TraitChip;
