import { Card, Chip, Alert } from '@heroui/react';
import type { OAuthAuthorizationDetails } from '@supabase/supabase-js';
import React from 'react';

import { CustomButton, InfinityLoader } from '@components';
import { supabaseClient, getErrorMessage } from '@utils';

// Human-readable labels for the scopes we expose. Anything unknown is shown
// verbatim so new scopes still render sensibly.
const SCOPE_LABELS: Record<string, string> = {
  email: 'Your email address',
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
  const [details, setDetails] =
    React.useState<OAuthAuthorizationDetails | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
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

    // Resolve the session ourselves rather than waiting on the global user
    // store to hydrate — `getSession` reads the persisted session directly, so
    // the page never stalls on the spinner awaiting external state. No session
    // means genuinely logged out: bounce to login and return here after.
    const run = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session) {
        const returnTo = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        window.location.href = `/account?returnTo=${returnTo}`;

        return;
      }

      const { data, error: detailsError } =
        await supabaseClient.auth.oauth.getAuthorizationDetails(
          authorizationId
        );

      if (detailsError) {
        throw detailsError;
      }

      // Already consented previously → Supabase hands back a redirect URL.
      if ('redirect_url' in data) {
        window.location.href = data.redirect_url;

        return;
      }

      setDetails(data);
    };

    run()
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [authorizationId]);

  const decide = async (approve: boolean) => {
    if (!authorizationId) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

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
    } catch (error) {
      // A transient approve/deny failure is retryable — surface it inline on
      // the consent card rather than tripping the fatal "couldn't load" screen.
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = <title>Authorize Access | Habitrack</title>;

  if (isLoading) {
    return (
      <div className="mt-16 flex w-full flex-col items-center gap-3">
        {title}
        <InfinityLoader color="var(--accent)" />
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
          {submitError && (
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>{submitError}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}
        </Card.Content>
        <Card.Footer className="justify-end gap-2">
          <CustomButton
            variant="outline"
            isDisabled={isSubmitting}
            onPress={() => {
              return decide(false);
            }}
          >
            Deny
          </CustomButton>
          <CustomButton
            variant="primary"
            isDisabled={isSubmitting}
            onPress={() => {
              return decide(true);
            }}
          >
            Allow
          </CustomButton>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default OAuthConsentPage;
