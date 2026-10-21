import { RouterContextProvider } from 'react-router';

import { userContext, type SessionUser } from '@utils';

const makeRouteArgs = <TArgs>(
  url: string,
  user: SessionUser = null,
  init?: RequestInit
) => {
  const context = new RouterContextProvider();
  context.set(userContext, user);

  return {
    context,
    params: {},
    request: new Request(url, init),
  } as unknown as TArgs;
};

export default makeRouteArgs;
