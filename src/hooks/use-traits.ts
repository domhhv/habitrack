import type { Trait } from '@models';

import useAppLoaderData from './use-app-loader-data';

const NO_TRAITS: Record<Trait['id'], Trait> = {};

const useTraits = () => {
  return useAppLoaderData()?.traits ?? NO_TRAITS;
};

export default useTraits;
