import { RouterContextProvider } from 'react-router';

import type { TypedSupabaseClient } from '@models';
import { userContext, supabaseContext, type SessionUser } from '@utils';

export const testSupabaseClient = {
  isTestSupabaseClient: true,
} as unknown as TypedSupabaseClient;

const makeRouteArgs = <TArgs>(
  url: string,
  user: SessionUser = null,
  init?: RequestInit
) => {
  const context = new RouterContextProvider();
  context.set(supabaseContext, testSupabaseClient);
  context.set(userContext, user);

  return {
    context,
    params: {},
    request: new Request(url, init),
  } as unknown as TArgs;
};

export default makeRouteArgs;
