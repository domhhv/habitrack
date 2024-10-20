import { TraitsContext, useSnackbar } from '@context';
import { useDataFetch } from '@hooks';
import type { Trait } from '@models';
import { listTraits, createTrait, type TraitsInsert } from '@services';
import { useUser } from '@supabase/auth-helpers-react';
import { makeTestTrait } from '@tests';
import React, { type ReactNode } from 'react';

const TraitsProvider = ({ children }: { children: ReactNode }) => {
  const [publicTraits, setPublicTraits] = React.useState<Trait[]>([]);
  const [userTraits, setUserTraits] = React.useState<Trait[]>([
    makeTestTrait({ name: 'Test Good Trait', color: '#2AF004' }),
    makeTestTrait({ name: 'Test Bad Trait', color: '#F6F6F6' }),
  ]);
  const [fetchingTraits, setFetchingTraits] = React.useState(false);
  const [addingTrait, setAddingTrait] = React.useState(false);
  const { showSnackbar } = useSnackbar();
  const user = useUser();

  const clearTraits = React.useCallback(() => {
    setPublicTraits([]);
    setUserTraits([]);
  }, []);

  const fetchTraits = React.useCallback(async () => {
    setFetchingTraits(true);

    const traits = await listTraits();

    const publicTraits = traits.filter((trait: Trait) => !trait.userId);
    const userTraits = traits.filter((trait: Trait) => trait.userId);
    setPublicTraits(publicTraits);
    setUserTraits(userTraits);
    setFetchingTraits(false);
  }, []);

  useDataFetch({
    load: fetchTraits,
    clear: clearTraits,
  });

  const addTrait = React.useCallback(
    async (trait: TraitsInsert) => {
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
      publicTraits,
      userTraits,
      fetchingTraits,
      addTrait,
    };
  }, [addingTrait, publicTraits, userTraits, fetchingTraits, addTrait]);

  return (
    <TraitsContext.Provider value={value}>{children}</TraitsContext.Provider>
  );
};

export default React.memo(TraitsProvider);
