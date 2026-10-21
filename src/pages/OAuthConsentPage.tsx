import { Card, Chip, Alert } from '@heroui/react';
import React from 'react';
import {
  data,
  Form,
  redirect,
  redirectDocument,
  isRouteErrorResponse,
} from 'react-router';

import { CustomButton } from '@components';
import { useIsSubmitting } from '@hooks';
import { decideAuthorization, getAuthorizationDetails } from '@services';
import { userContext, getErrorMessage } from '@utils';

import type { Route } from './+types/OAuthConsentPage';

/* Unknown scopes are shown verbatim so new ones still render sensibly. */
const SCOPE_LABELS: Record<string, string> = {
  email: 'Your email address',
  openid: 'Verify your identity',
  profile: 'Your basic profile',
};

const MISSING_AUTHORIZATION_ID_MESSAGE =
  'Missing authorization_id. This page expects an OAuth request.';

export const clientLoader = async ({
  context,
  request,
}: Route.ClientLoaderArgs) => {
  const { pathname, search, searchParams } = new URL(request.url);
  const authorizationId = searchParams.get('authorization_id');

  if (!authorizationId) {
    throw data(MISSING_AUTHORIZATION_ID_MESSAGE, { status: 400 });
  }

  if (!context.get(userContext)) {
    throw redirect(
      `/settings?returnTo=${encodeURIComponent(pathname + search)}`
    );
  }

  const details = await getAuthorizationDetails(authorizationId);

  if ('redirect_url' in details) {
    throw redirectDocument(details.redirect_url);
  }

  return { details };
};

export const clientAction = async ({ request }: Route.ClientActionArgs) => {
  const authorizationId = new URL(request.url).searchParams.get(
    'authorization_id'
  );
  const formData = await request.formData();

  if (!authorizationId) {
    return data({ error: MISSING_AUTHORIZATION_ID_MESSAGE }, { status: 400 });
  }

  try {
    const redirectUrl = await decideAuthorization(
      authorizationId,
      formData.get('decision') === 'approve'
    );

    return redirectDocument(redirectUrl);
  } catch (error) {
    return data({ error: getErrorMessage(error) }, { status: 400 });
  }
};

const title = <title>Authorize Access | Habitrack</title>;

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  return (
    <div className="mt-16 flex w-full justify-center px-4">
      {title}
      <Alert status="danger" className="w-full max-w-md">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title className="font-bold">
            Couldn&apos;t load this authorization request
          </Alert.Title>
          <Alert.Description>
            {isRouteErrorResponse(error)
              ? String(error.data)
              : getErrorMessage(error)}
          </Alert.Description>
        </Alert.Content>
      </Alert>
    </div>
  );
};

/**
 * Consent screen for the Supabase OAuth 2.1 server.
 *
 * Supabase redirects users here (the configured "authorization path") with an
 * `authorization_id` query param after it has validated an /authorize request
 * from an MCP client. We show what the client is asking for and let the user
 * approve or deny; the SDK then redirects back to the client with a code.
 *
 * Route: /oauth/consent
 */
const OAuthConsentPage = ({
  actionData,
  loaderData: { details },
}: Route.ComponentProps) => {
  const isSubmitting = useIsSubmitting();
  const scopes = details.scope.split(' ').filter(Boolean);

  return (
    <div className="mt-12 flex w-full justify-center px-4">
      {title}
      <Card className="w-full max-w-md">
        <Card.Header className="flex-col items-start gap-1">
          <h1 className="text-xl font-bold">Authorize {details.client.name}</h1>
          <p className="text-default-500 text-sm">
            <span className="font-medium">{details.client.name}</span> wants to
            access your Habitrack account
            {details.user.email ? ` (${details.user.email})` : ''}.
          </p>
        </Card.Header>
        <Card.Content className="gap-4">
          <div>
            <p className="text-default-600 mb-2 text-sm font-medium">
              This will allow it to:
            </p>
            <div className="flex flex-wrap gap-2">
              <Chip size="sm" variant="soft">
                Read and log your habits, occurrences, and notes
              </Chip>
              {scopes.map((scope) => {
                return (
                  <Chip size="sm" key={scope} variant="soft">
                    {SCOPE_LABELS[scope] ?? scope}
                  </Chip>
                );
              })}
            </div>
          </div>
          <p className="text-default-400 text-xs">
            Redirects to{' '}
            <span className="font-mono">{details.redirect_uri}</span>. You can
            revoke this access at any time from your account settings.
          </p>
          {actionData?.error && (
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>{actionData.error}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}
        </Card.Content>
        <Card.Footer>
          <Form method="post" className="flex w-full justify-end gap-2">
            <CustomButton
              value="deny"
              type="submit"
              name="decision"
              variant="outline"
              isDisabled={isSubmitting}
            >
              Deny
            </CustomButton>
            <CustomButton
              type="submit"
              name="decision"
              value="approve"
              variant="primary"
              isDisabled={isSubmitting}
            >
              Allow
            </CustomButton>
          </Form>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default OAuthConsentPage;
