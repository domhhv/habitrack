import React from 'react';
import { useFetcher } from 'react-router';

import type { ActionResult } from '@models';

import useActionToasts from './use-action-toasts';

type ActionFetcherOptions = {
  key?: string;
  onFailure?: (result: Extract<ActionResult, { ok: false }>) => void;
};

const useActionFetcher = <TData extends ActionResult = ActionResult>(
  onSuccess?: () => void,
  { key, onFailure }: ActionFetcherOptions = {}
) => {
  const fetcher = useFetcher<TData>({ key });
  const handleResult = React.useEffectEvent((result: ActionResult) => {
    if (result.ok) {
      onSuccess?.();
    } else {
      onFailure?.(result);
    }
  });

  useActionToasts(fetcher.data);

  React.useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      handleResult(fetcher.data);
    }
  }, [fetcher.state, fetcher.data]);

  return fetcher;
};

export default useActionFetcher;
