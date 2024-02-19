import type { Trait, TraitsMap } from '@models';
import { listTraits } from '@services';
import React from 'react';

const useTraits = () => {
  const [publicTraits, setPublicTraits] = React.useState<Trait[]>([]);
  const [userTraits, setUserTraits] = React.useState<Trait[]>([]);
  const [traitsMap, setTraitsMap] = React.useState<TraitsMap>({});
  const [fetchingTraits, setFetchingTraits] = React.useState(false);

  React.useEffect(() => {
    const loadTraits = async () => {
      setFetchingTraits(true);

      const traits = await listTraits();

      const publicTraits = traits.filter((trait: Trait) => !trait.user_id);
      const userTraits = traits.filter((trait: Trait) => trait.user_id);
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

  return { traitsMap, publicTraits, userTraits, fetchingTraits };
};

export default useTraits;
