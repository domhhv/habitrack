import { Toast, Spinner } from '@heroui/react';
import { GoogleLogoIcon } from '@phosphor-icons/react';
import type { UserIdentity } from '@supabase/supabase-js';
import React from 'react';

import { CustomButton } from '@components';
import {
  unlinkIdentity,
  getUserIdentities,
  linkGoogleIdentity,
} from '@services';
import { getErrorMessage } from '@utils';

const ConnectedAccounts = () => {
  const [identities, setIdentities] = React.useState<UserIdentity[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const fetchIdentities = React.useCallback(async () => {
    try {
      setIdentities(await getUserIdentities());
    } catch (error) {
      Toast.toast.danger('Failed to load connected accounts', {
        description: getErrorMessage(error) || 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchIdentities();
  }, [fetchIdentities]);

  const googleIdentity = identities.find((identity) => {
    return identity.provider === 'google';
  });
  const canUnlink = identities.length > 1;

  const handleLink = async () => {
    try {
      setIsProcessing(true);
      await linkGoogleIdentity();
    } catch (error) {
      Toast.toast.danger('Failed to link Google account', {
        description: getErrorMessage(error) || 'Please try again later',
      });
      setIsProcessing(false);
    }
  };

  const handleUnlink = async () => {
    if (!googleIdentity) {
      return;
    }

    try {
      setIsProcessing(true);
      await unlinkIdentity(googleIdentity);
      await fetchIdentities();
      Toast.toast.success('Google account unlinked');
    } catch (error) {
      Toast.toast.danger('Failed to unlink Google account', {
        description: getErrorMessage(error) || 'Please try again later',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full justify-center py-8">
        <Spinner aria-label="Loading connected accounts" />
      </div>
    );
  }

  return (
    <div data-testid="connected-accounts" className="flex w-full flex-col">
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
