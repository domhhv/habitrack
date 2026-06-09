import { Card, Chip, Alert, Button, Spinner } from '@heroui/react';
import type { OAuthAuthorizationDetails } from '@supabase/supabase-js';
import React from 'react';

import { useUser } from '@stores';
import { supabaseClient } from '@utils';

// Human-readable labels for the scopes we expose. Anything unknown is shown
// verbatim so new scopes still render sensibly.
const SCOPE_LABELS: Record<string, string> = {
  email: 'Your email address',
  'habits:read': 'Read your habits and occurrences',
  'habits:write': 'Create and update occurrences',
  openid: 'Verify your identity',
  profile: 'Your basic profile',
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
const OAuthConsentPage = () => {
  const user = useUser();
  const [details, setDetails] =
    React.useState<OAuthAuthorizationDetails | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const authorizationId = React.useMemo(() => {
    return new URLSearchParams(window.location.search).get('authorization_id');
  }, []);

  React.useEffect(() => {
    if (!authorizationId) {
      setError('Missing authorization_id. This page expects an OAuth request.');
      setIsLoading(false);

      return;
    }

    // `useUser` returns null both while the session is still loading and when
    // the user is genuinely logged out. Confirm with getSession before
    // deciding to bounce to login, so we don't redirect mid-load.
    if (user === null) {
      supabaseClient.auth.getSession().then(({ data }) => {
        if (!data.session) {
          const returnTo = encodeURIComponent(
            window.location.pathname + window.location.search
          );
          window.location.href = `/account?returnTo=${returnTo}`;
        }
      });

      return;
    }

    supabaseClient.auth.oauth
      .getAuthorizationDetails(authorizationId)
      .then(({ data, error: detailsError }) => {
        if (detailsError) {
          throw detailsError;
        }

        // Already consented previously → Supabase hands back a redirect URL.
        if ('redirect_url' in data) {
          window.location.href = data.redirect_url;

          return;
        }

        setDetails(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [authorizationId, user]);

  const decide = async (approve: boolean) => {
    if (!authorizationId) {
      return;
    }

    setIsSubmitting(true);

    try {
      // skipBrowserRedirect: true so we control navigation explicitly.
      const { data, error: decisionError } = approve
        ? await supabaseClient.auth.oauth.approveAuthorization(
            authorizationId,
            { skipBrowserRedirect: true }
          )
        : await supabaseClient.auth.oauth.denyAuthorization(authorizationId, {
            skipBrowserRedirect: true,
          });

      if (decisionError) {
        throw decisionError;
      }

      window.location.href = data.redirect_url;
    } catch (err) {
      setError((err as Error).message);
      setIsSubmitting(false);
    }
  };

  const title = <title>Authorize Access | Habitrack</title>;

  if (isLoading) {
    return (
      <div className="mt-16 flex w-full flex-col items-center gap-3">
        {title}
        <Spinner />
        <p className="text-default-500 text-sm">
          Loading authorization request…
        </p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="mt-16 flex w-full justify-center px-4">
        {title}
        <Alert status="danger" className="w-full max-w-md">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title className="font-bold">
              Couldn&apos;t load this authorization request
            </Alert.Title>
            <Alert.Description>{error ?? 'Unknown error.'}</Alert.Description>
          </Alert.Content>
        </Alert>
      </div>
    );
  }

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
        </Card.Content>
        <Card.Footer className="justify-end gap-2">
          <Button
            variant="outline"
            isDisabled={isSubmitting}
            onPress={() => {
              return decide(false);
            }}
          >
            Deny
          </Button>
          <Button
            variant="primary"
            isDisabled={isSubmitting}
            onPress={() => {
              return decide(true);
            }}
          >
            Allow
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default OAuthConsentPage;
