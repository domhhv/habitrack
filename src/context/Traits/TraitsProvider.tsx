import { TraitsContext } from '@context';
import { useDataFetch } from '@hooks';
import type { Trait, TraitsInsert } from '@models';
import { listTraits, createTrait } from '@services';
import { useSnackbarsStore } from '@stores';
import { makeTestTrait } from '@tests';
import { getErrorMessage } from '@utils';
import React, { type ReactNode } from 'react';

const testTraits = [
  makeTestTrait({ name: 'Test Good Trait', color: '#2AF004' }),
  makeTestTrait({ name: 'Test Bad Trait', color: '#F6F6F6' }),
];

const TraitsProvider = ({ children }: { children: ReactNode }) => {
  const { showSnackbar } = useSnackbarsStore();
  const [traits, setTraits] = React.useState<Trait[]>(testTraits);
  const [fetchingTraits, setFetchingTraits] = React.useState(false);
  const [addingTrait, setAddingTrait] = React.useState(false);

  const clearTraits = React.useCallback(() => {
    setTraits([]);
  }, []);

  const fetchTraits = React.useCallback(async () => {
    try {
      setFetchingTraits(true);
      setTraits(await listTraits());
    } catch (error) {
      console.error(error);
      showSnackbar(
        'Something went wrong while fetching your traits. Please try reloading the page.',
        {
          description: `Error details: ${getErrorMessage(error)}`,
          color: 'danger',
          dismissible: true,
        }
      );
    } finally {
      setFetchingTraits(false);
    }
  }, [showSnackbar]);

  useDataFetch({
    load: fetchTraits,
    clear: clearTraits,
  });

  const addTrait = React.useCallback(
    async (trait: TraitsInsert) => {
      try {
        setAddingTrait(true);

        const newTrait = await createTrait(trait);

        setTraits((prevUserTraits) => [...prevUserTraits, newTrait]);

        showSnackbar('Trait added successfully', {
          color: 'success',
          dismissible: true,
          dismissText: 'Done',
        });
      } catch (error) {
        console.error(error);
        showSnackbar('Something went wrong while adding your trait', {
          description: `Error details: ${getErrorMessage(error)}`,
          color: 'danger',
          dismissible: true,
        });
      } finally {
        setAddingTrait(false);
      }
    },
    [showSnackbar]
  );

  const value = React.useMemo(() => {
    return {
      addingTrait,
      traits,
      fetchingTraits,
      addTrait,
    };
  }, [addingTrait, traits, fetchingTraits, addTrait]);

  return (
    <TraitsContext.Provider value={value}>{children}</TraitsContext.Provider>
  );
};

export default React.memo(TraitsProvider);
