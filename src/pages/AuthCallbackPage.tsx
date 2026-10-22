import { Alert } from '@heroui/react';
import React from 'react';
import { data, redirect } from 'react-router';

import { CustomButton } from '@components';
import type { TypedSupabaseClient } from '@models';
import { verifyEmailOtp, exchangeCodeForSession } from '@services';
import {
  isEmailOtpType,
  getErrorMessage,
  supabaseContext,
  getSafeRedirectPath,
  DEFAULT_SIGNED_IN_PATH,
} from '@utils';

import type { Route } from './+types/AuthCallbackPage';

const CALLBACK_PATH = '/auth/callback';

/**
 * Email redirects point at this route too, so with token-hash email templates `next` is this
 * route's own URL. Following that would land here again without a token, so its inner `next`
 * is used instead.
 */
const getNextPath = (requestUrl: string) => {
  const getNext = (url: URL) => {
    return getSafeRedirectPath(
      url.searchParams.get('next'),
      requestUrl,
      DEFAULT_SIGNED_IN_PATH
    );
  };

  const next = getNext(new URL(requestUrl));
  const nextUrl = new URL(next, requestUrl);

  if (nextUrl.pathname !== CALLBACK_PATH) {
    return next;
  }

  const innerNext = getNext(nextUrl);

  return new URL(innerNext, requestUrl).pathname === CALLBACK_PATH
    ? DEFAULT_SIGNED_IN_PATH
    : innerNext;
};

const completeSignIn = async (
  supabase: TypedSupabaseClient,
  searchParams: URLSearchParams
) => {
  const providerError =
    searchParams.get('error_description') || searchParams.get('error');
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  if (providerError) {
    throw new Error(providerError);
  }

  if (code) {
    return exchangeCodeForSession(supabase, code);
  }

  if (tokenHash && isEmailOtpType(type)) {
    return verifyEmailOtp(supabase, tokenHash, type);
  }

  throw new Error('This link is incomplete. Please request a new one.');
};

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url);

  try {
    await completeSignIn(context.get(supabaseContext), searchParams);
  } catch (error) {
    return data({ error: getErrorMessage(error) }, { status: 400 });
  }

  throw redirect(getNextPath(request.url));
};

const AuthCallbackPage = ({ loaderData: { error } }: Route.ComponentProps) => {
  return (
    <div className="mx-auto flex h-full w-3xl max-w-11/12 flex-1 items-center justify-center">
      <title>Sign-in link | Habitrack</title>
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title className="font-bold">
            We couldn&apos;t sign you in with this link
          </Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Content>
        <CustomButton href="/login" variant="danger-soft">
          Log in
        </CustomButton>
      </Alert>
    </div>
  );
};

export default AuthCallbackPage;
