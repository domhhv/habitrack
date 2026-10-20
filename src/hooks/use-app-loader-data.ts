import { useRouteLoaderData } from 'react-router';

import type { clientLoader } from '../App';

const useAppLoaderData = () => {
  return useRouteLoaderData<typeof clientLoader>('app');
};

export default useAppLoaderData;
