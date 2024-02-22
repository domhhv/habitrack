import { TraitsContext } from '@context';
import type { Trait, TraitsMap } from '@models';
import { listTraits } from '@services';
import React from 'react';

type TraitsProviderProps = {
  children: React.ReactNode;
};

const TraitsProvider = ({ children }: TraitsProviderProps) => {
  const [publicTraits, setPublicTraits] = React.useState<Trait[]>([]);
  const [userTraits, setUserTraits] = React.useState<Trait[]>([]);
  const [traitsMap, setTraitsMap] = React.useState<TraitsMap>({});
  const [fetchingTraits, setFetchingTraits] = React.useState(false);
  console.log('useTraits');

  const allTraits = [...publicTraits, ...userTraits];

  React.useEffect(() => {
    const loadTraits = async () => {
      setFetchingTraits(true);

      const traits = await listTraits();

      const publicTraits = traits.filter((trait: Trait) => !trait.userId);
      const userTraits = traits.filter((trait: Trait) => trait.userId);
      setPublicTraits(publicTraits);
      setUserTraits(userTraits);
      setTraitsMap(
        traits.reduce((acc, trait) => {
          return { ...acc, [trait.id]: trait };
        }, {})
      );
      setFetchingTraits(false);
    };

    void loadTraits();
  }, []);

  return (
    <TraitsContext.Provider
      value={{
        allTraits,
        traitsMap,
        publicTraits,
        userTraits,
        fetchingTraits,
      }}
    >
      {children}
    </TraitsContext.Provider>
  );
};

export default TraitsProvider;
