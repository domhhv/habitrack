import React from 'react';
import { useFetcher } from 'react-router';

import type { ActionResult } from '@models';

import useActionToasts from './use-action-toasts';

const useActionFetcher = <TData extends ActionResult = ActionResult>(
  onSuccess?: () => void
) => {
  const fetcher = useFetcher<TData>();
  const handleSuccess = React.useEffectEvent(() => {
    onSuccess?.();
  });

  useActionToasts(fetcher.data);

  React.useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.ok) {
      handleSuccess();
    }
  }, [fetcher.state, fetcher.data]);

  return fetcher;
};

export default useActionFetcher;
