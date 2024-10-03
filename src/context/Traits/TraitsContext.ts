import type { Trait, AddTrait } from '@models';
import React from 'react';

type TraitsContextType = {
  addingTrait: boolean;
  addTrait: (trait: AddTrait) => Promise<void>;
  allTraits: Trait[];
  traitsMap: Record<string, Trait>;
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
