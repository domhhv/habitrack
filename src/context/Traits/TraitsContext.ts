import type { Trait } from '@models';
import { type TraitsInsert } from '@services';
import React from 'react';

type TraitsContextType = {
  addingTrait: boolean;
  addTrait: (trait: TraitsInsert) => Promise<void>;
  allTraits: Trait[];
  publicTraits: Trait[];
  userTraits: Trait[];
  fetchingTraits: boolean;
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
