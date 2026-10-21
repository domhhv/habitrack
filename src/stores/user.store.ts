import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { CamelCasedPropertiesDeep } from 'type-fest';

import { useBoundStore, type SliceCreator } from './bound.store';

type User = Pick<SupabaseUser, 'id' | 'email' | 'is_anonymous'> & {
  fetchedAt: string;
};

export type UserSlice = {
  user: null | CamelCasedPropertiesDeep<User>;
  userActions: {
    setUser: (user: null | CamelCasedPropertiesDeep<User>) => void;
  };
};

export const createUserSlice: SliceCreator<keyof UserSlice> = (
  set,
  getState
) => {
  return {
    user: null,
    userActions: {
      setUser: (user) => {
        if (getState().user?.id === user?.id) {
          return;
        }

        set(
          (state) => {
            state.user = user;
          },
          undefined,
          'userActions.setUser'
        );
      },
    },
  };
};

export const useUserActions = () => {
  return useBoundStore((state) => {
    return state.userActions;
  });
};
