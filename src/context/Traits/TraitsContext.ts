import type { Trait } from '@models';
import { type TraitsInsert } from '@services';
import React from 'react';

type TraitsContextType = {
  traits: Trait[];
  fetchingTraits: boolean;
  addingTrait: boolean;
  addTrait: (trait: TraitsInsert) => Promise<void>;
};

export const TraitsContext = React.createContext<TraitsContextType | null>(
  null
);

export const useTraits = () => {
  const context = React.useContext(TraitsContext);

  if (!context) {
    throw new Error('useTraits must be used within a TraitsProvider');
  }

  return context;
};
