import type {
  UserAttributes,
  User as SupabaseUser,
} from '@supabase/supabase-js';
import type { CamelCasedPropertiesDeep } from 'type-fest';
import { useShallow } from 'zustand/react/shallow';

import { updateUser } from '@services';

import { useBoundStore, type SliceCreator } from './bound.store';

type User = SupabaseUser & {
  fetchedAt: string;
};

export type UserSlice = {
  user: null | CamelCasedPropertiesDeep<User>;
  actions: {
    setUser: (user: null | CamelCasedPropertiesDeep<User>) => void;
    updateUser: (opts: {
      email?: string;
      firstDayOfWeek?: string;
      name?: string;
      password?: string;
    }) => Promise<CamelCasedPropertiesDeep<User> | void>;
  };
};

export const createUserSlice: SliceCreator<keyof UserSlice> = (
  set,
  getState
) => {
  return {
    user: null,
    actions: {
      setUser: (user) => {
        set((state) => {
          state.user = user;
        });
      },
      updateUser: async (opts) => {
        const { user } = getState();

        if (!user) {
          return;
        }

        const userAttributes: UserAttributes = {};

        if (opts.email !== user.email) {
          userAttributes.email = opts.email;
        }

        if (opts.password) {
          userAttributes.password = opts.password;
        }

        const userMetadata: Record<string, string | number> = {};

        if (
          opts.firstDayOfWeek &&
          opts.firstDayOfWeek !== user.userMetadata.firstDayOfWeek?.toString()
        ) {
          userMetadata.firstDayOfWeek = Number(opts.firstDayOfWeek);
        }

        if (opts.name && opts.name !== user.userMetadata.name) {
          userMetadata.name = opts.name;
        }

        if (Object.keys(userMetadata).length > 0) {
          userAttributes.data = userMetadata;
        }

        const updatedSupabaseUser = await updateUser(userAttributes);

        const newUser = {
          ...updatedSupabaseUser,
          fetchedAt: new Date().toISOString(),
        };

        set((state) => {
          state.user = newUser;
        });

        return newUser;
      },
    },
  };
};

export const useUser = () => {
  return useBoundStore(
    useShallow((state) => {
      return {
        user: state.user,
      };
    })
  );
};

export const useUserActions = () => {
  return useBoundStore((state) => {
    return state.actions;
  });
};
