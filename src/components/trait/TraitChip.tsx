import { Chip } from '@heroui/react';
import React from 'react';

import type { Trait } from '@models';

type TraitChipProps = {
  trait: Pick<Trait, 'name' | 'color'> | null;
};

const TraitChip = ({ trait }: TraitChipProps) => {
  return (
    <Chip size="sm" variant="faded" color="secondary" className="h-5 border">
      <div className="flex items-center gap-1 font-semibold">
        <span
          role="habit-trait-chip-color-indicator"
          className="mr-0.5 inline-block h-1 w-1 rounded-full"
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
