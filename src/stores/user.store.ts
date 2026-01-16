import type { User, AuthError, UserAttributes } from '@supabase/supabase-js';
import type { CamelCasedPropertiesDeep } from 'type-fest';
import { useShallow } from 'zustand/react/shallow';

import { updateUser } from '@services';

import { useBoundStore, type SliceCreator } from './bound.store';

export type UserSlice = {
  error: AuthError | null;
  isLoading: boolean;
  user: null | CamelCasedPropertiesDeep<User>;
  actions: {
    setError: (error: AuthError | null) => void;
    setIsLoading: (isLoading: boolean) => void;
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
    error: null,
    isLoading: true,
    user: null,
    actions: {
      setError: (error) => {
        set((state) => {
          state.error = error;
        });
      },
      setIsLoading: (isLoading) => {
        set((state) => {
          state.isLoading = isLoading;
        });
      },
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

        const updatedUser = await updateUser(userAttributes);

        set((state) => {
          state.user = { ...state.user, ...updatedUser };
        });

        return updatedUser;
      },
    },
  };
};

export const useUser = () => {
  return useBoundStore(
    useShallow((state) => {
      return {
        error: state.error,
        isLoading: state.isLoading,
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
