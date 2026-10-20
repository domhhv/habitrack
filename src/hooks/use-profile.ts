import useAppLoaderData from './use-app-loader-data';

const useProfile = () => {
  return useAppLoaderData()?.profile ?? null;
};

export default useProfile;
