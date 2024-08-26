import { TraitsContext, useSnackbar } from '@context';
import type { Trait, TraitsMap, AddTrait } from '@models';
import { listTraits, createTrait } from '@services';
import { useUser } from '@supabase/auth-helpers-react';
import React from 'react';

type TraitsProviderProps = {
  children: React.ReactNode;
};

const TraitsProvider = ({ children }: TraitsProviderProps) => {
  const [publicTraits, setPublicTraits] = React.useState<Trait[]>([]);
  const [userTraits, setUserTraits] = React.useState<Trait[]>([]);
  const [traitsMap, setTraitsMap] = React.useState<TraitsMap>({});
  const [fetchingTraits, setFetchingTraits] = React.useState(false);
  const [addingTrait, setAddingTrait] = React.useState(false);
  const { showSnackbar } = useSnackbar();
  const user = useUser();

  React.useEffect(() => {
    const loadTraits = async () => {
      setFetchingTraits(true);

      const traits = await listTraits();

      const publicTraits = traits.filter((trait: Trait) => !trait.userId);
      const userTraits = traits.filter((trait: Trait) => trait.userId);
      setPublicTraits(publicTraits);
      setUserTraits(userTraits);
      setFetchingTraits(false);
    };

    void loadTraits();
  }, []);

  React.useEffect(() => {
    const nextTraits = [...publicTraits, ...userTraits];
    setTraitsMap(
      nextTraits.reduce((acc, trait) => {
        return { ...acc, [trait.id]: trait };
      }, {})
    );
  }, [publicTraits, userTraits]);

  const addTrait = React.useCallback(
    async (trait: Omit<AddTrait, 'userId'>) => {
      try {
        setAddingTrait(true);

        const newTrait = await createTrait({ ...trait, userId: user!.id });

        setUserTraits((prevUserTraits) => [...prevUserTraits, newTrait]);

        showSnackbar('Trait added successfully', {
          color: 'success',
          dismissible: true,
          dismissText: 'Done',
        });
      } catch (error) {
        console.error(error);
        showSnackbar(
          (error as Error).message ||
            'Something went wrong while adding your trait',
          {
            color: 'danger',
            dismissible: true,
          }
        );
      } finally {
        setAddingTrait(false);
      }
    },
    [showSnackbar, user]
  );

  const value = React.useMemo(() => {
    const allTraits = [...publicTraits, ...userTraits];

    return {
      addingTrait,
      allTraits,
      traitsMap,
      publicTraits,
      userTraits,
      fetchingTraits,
      addTrait,
    };
  }, [
    addingTrait,
    traitsMap,
    publicTraits,
    userTraits,
    fetchingTraits,
    addTrait,
  ]);

  return (
    <TraitsContext.Provider value={value}>{children}</TraitsContext.Provider>
  );
};

export default React.memo(TraitsProvider);
