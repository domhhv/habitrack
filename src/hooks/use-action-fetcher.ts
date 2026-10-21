import React from 'react';
import { useFetcher } from 'react-router';

type ActionResult = { error: string; ok: false } | { ok: true };

const useActionFetcher = (onSuccess?: () => void) => {
  const fetcher = useFetcher<ActionResult>();
  const handleSuccess = React.useEffectEvent(() => {
    onSuccess?.();
  });

  React.useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.ok) {
      handleSuccess();
    }
  }, [fetcher.state, fetcher.data]);

  return fetcher;
};

export default useActionFetcher;
