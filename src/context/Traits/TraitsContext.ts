import type { Trait, AddTrait } from '@models';
import React from 'react';

export const TraitsContext = React.createContext({
  addingTrait: false,
  addTrait: (_: AddTrait) => Promise.resolve(),
  allTraits: [] as Trait[],
  traitsMap: {} as Record<string, Trait>,
  publicTraits: [] as Trait[],
  userTraits: [] as Trait[],
  fetchingTraits: false,
});

export const useTraits = () => {
  const context = React.useContext(TraitsContext);

  if (context === undefined) {
    throw new Error('useTraits must be used within a TraitsProvider');
  }

  return context;
};
