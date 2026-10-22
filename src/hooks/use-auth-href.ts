import { useSearchParams } from 'react-router';

const useAuthHref = (path: string) => {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  return returnTo ? `${path}?${new URLSearchParams({ returnTo })}` : path;
};

export default useAuthHref;
