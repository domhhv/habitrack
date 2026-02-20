import type {
  UserAttributes,
  User as SupabaseUser,
} from '@supabase/supabase-js';
import type { CamelCasedPropertiesDeep } from 'type-fest';
import { useShallow } from 'zustand/react/shallow';

import type { Profile, ProfilesUpdate } from '@models';
import { getProfile, updateUser, patchProfile } from '@services';

import { useBoundStore, type SliceCreator } from './bound.store';

type User = Pick<SupabaseUser, 'id' | 'email'> & {
  fetchedAt: string;
};

export type UserSlice = {
  profile: Profile | null;
  user: null | CamelCasedPropertiesDeep<User>;
  userActions: {
    clearProfile: () => void;
    fetchProfile: (userId: string) => Promise<void>;
    setUser: (user: null | CamelCasedPropertiesDeep<User>) => void;
    updateProfile: (
      userId: string,
      profile: Pick<ProfilesUpdate, 'email' | 'name' | 'firstDayOfWeek'>
    ) => Promise<void>;
    updateUser: (opts: {
      email?: string;
      password?: string;
    }) => Promise<CamelCasedPropertiesDeep<User> | void>;
  };
};

export const createUserSlice: SliceCreator<keyof UserSlice> = (
  set,
  getState
) => {
  return {
    profile: null,
    user: null,
    userActions: {
      clearProfile: () => {
        set((state) => {
          state.profile = null;
        });
      },
      fetchProfile: async (userId) => {
        if (getState().profile?.id === userId) {
          return;
        }

        const profile = await getProfile(userId);

        set((state) => {
          state.profile = profile;
        });
      },
      setUser: (user) => {
        if (getState().user?.id === user?.id) {
          return;
        }

        set((state) => {
          state.user = user;
        });
      },
      updateProfile: async (userId, profile) => {
        const newProfile = await patchProfile(userId, profile);

        set((state) => {
          state.profile = newProfile;
        });
      },
      updateUser: async (opts) => {
        console.log('updateUser');
        const { user } = getState();

        if (!user) {
          return;
        }

        console.log('updateUser opts: ', opts);

        const userAttributes: UserAttributes = {};

        if (opts.email !== user.email) {
          userAttributes.email = opts.email;
        }

        if (opts.password) {
          userAttributes.password = opts.password;
        }

        if (!Object.keys(userAttributes).length) {
          return;
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

export const useProfile = () => {
  return useBoundStore(
    useShallow((state) => {
      return state.profile;
    })
  );
};

export const useUserActions = () => {
  return useBoundStore((state) => {
    return state.userActions;
  });
};
