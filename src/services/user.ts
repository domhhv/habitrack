import { type LocalUser, type User } from '@context';

import { post } from './http';

export const login = async (
  username: string,
  password: string
): Promise<LocalUser> => {
  return post('/auth/login', {
    username,
    password,
  });
};

export const register = async (
  username: string,
  password: string
): Promise<User> => {
  return post('/auth/register', {
    username,
    password,
  });
};
