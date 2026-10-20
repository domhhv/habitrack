import useAppLoaderData from './use-app-loader-data';

const useUser = () => {
  return useAppLoaderData()?.user ?? null;
};

export default useUser;
