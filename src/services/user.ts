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

type ValidateTokensResponse = LocalUser & {
  accessTokenExpired?: boolean;
};

export const validateTokens = async (
  accessToken: string,
  refreshToken: string
): Promise<ValidateTokensResponse> => {
  return post('/auth/tokens/validate', {
    accessToken,
    refreshToken,
  });
};

type RefreshTokensResponse = LocalUser & {
  refreshTokenExpired?: boolean;
};

export const regenerateAccessToken = async (
  refreshToken: string
): Promise<RefreshTokensResponse> => {
  return post('/auth/tokens/access/regenerate', {
    refreshToken,
  });
};
