import { Toast } from '@heroui/react';
import { GoogleLogoIcon } from '@phosphor-icons/react';
import type { UserIdentity } from '@supabase/supabase-js';
import React from 'react';

import { CustomButton } from '@components';
import { useActionFetcher } from '@hooks';
import { linkGoogleIdentity } from '@services';
import { getErrorMessage, getSupabaseBrowserClient } from '@utils';

type ConnectedAccountsProps = {
  identities: UserIdentity[];
  loadError: string | null;
};

const ConnectedAccounts = ({
  identities,
  loadError,
}: ConnectedAccountsProps) => {
  const fetcher = useActionFetcher();
  const [isLinking, setIsLinking] = React.useState(false);
  const isProcessing = fetcher.state !== 'idle' || isLinking;

  const googleIdentity = identities.find((identity) => {
    return identity.provider === 'google';
  });
  const canUnlink = identities.length > 1;

  /**
   * Linking leaves the page for Google's consent screen, so it runs in the browser and stays
   * pending until the redirect.
   */
  const handleLink = async () => {
    setIsLinking(true);

    try {
      await linkGoogleIdentity(
        getSupabaseBrowserClient(),
        window.location.origin
      );
    } catch (error) {
      setIsLinking(false);
      Toast.toast.danger('Failed to link Google account', {
        description: getErrorMessage(error) || 'Please try again later',
      });
    }
  };

  const handleUnlink = () => {
    if (!googleIdentity) {
      return;
    }

    void fetcher.submit(
      { identityId: googleIdentity.identity_id, intent: 'unlink-identity' },
      { action: '/settings', method: 'post' }
    );
  };

  return (
    <div data-testid="connected-accounts" className="flex w-full flex-col">
      {!!loadError && (
        <p className="text-danger mb-2 text-sm">
          Failed to load connected accounts: {loadError}
        </p>
      )}
      <div className="border-border flex w-full items-center justify-between gap-4 rounded-3xl border p-4">
        <div className="flex items-center gap-3">
          <GoogleLogoIcon size={24} weight="bold" />
          <div className="flex flex-col">
            <span className="font-medium">Google</span>
            <span className="text-muted text-sm">
              {googleIdentity
                ? googleIdentity.identity_data?.email || 'Connected'
                : 'Not connected'}
            </span>
          </div>
        </div>
        {googleIdentity ? (
          <CustomButton
            variant="bordered"
            onClick={handleUnlink}
            isPending={isProcessing}
            data-testid="unlink-google-button"
            isDisabled={isProcessing || !canUnlink}
          >
            Unlink
          </CustomButton>
        ) : (
          <CustomButton
            variant="primary"
            onClick={handleLink}
            isPending={isProcessing}
            isDisabled={isProcessing}
            data-testid="link-google-button"
          >
            Link
          </CustomButton>
        )}
      </div>
      {!!googleIdentity && !canUnlink && (
        <p className="text-muted mt-2 text-xs">
          Add a password or another login method before unlinking Google.
        </p>
      )}
    </div>
  );
};

export default ConnectedAccounts;
