import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { CamelCasedPropertiesDeep } from 'type-fest';

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
    updateUser: (opts: { email?: string; password?: string }) => Promise<void>;
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
        const updatedSupabaseUser = await updateUser(opts);

        set((state) => {
          state.user = {
            ...updatedSupabaseUser,
            fetchedAt: new Date().toISOString(),
          };
        });
      },
    },
  };
};

export const useUser = () => {
  return useBoundStore((state) => {
    return state.user;
  });
};

export const useProfile = () => {
  return useBoundStore((state) => {
    return state.profile;
  });
};

export const useUserActions = () => {
  return useBoundStore((state) => {
    return state.userActions;
  });
};
