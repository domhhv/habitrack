import { addToast } from '@heroui/react';
import capitalize from 'lodash.capitalize';

import getErrorMessage from './get-error-message';

type ActionVerb = 'add' | 'update' | 'remove' | 'fetch' | 'upload' | 'log';
type EntityNoun =
  | 'habit'
  | 'note'
  | 'occurrence'
  | 'trait'
  | 'account'
  | 'photo'
  | 'metric-value'
  | 'icon';

type ActionType = `${ActionVerb}_${EntityNoun}`;

const tenses: Record<string, Record<string, string>> = {
  continuous: {
    add: 'adding',
    fetch: 'fetching',
    log: 'logging',
    remove: 'removing',
    update: 'updating',
    upload: 'uploading',
  },
  past: {
    add: 'added',
    fetch: 'fetched',
    log: 'logged',
    remove: 'removed',
    update: 'updated',
    upload: 'uploaded',
  },
};

const getMessages = (actionType: ActionType) => {
  const [verb, noun] = actionType.split('_');

  const nouns = noun.split('-').join(' ');

  return {
    error: `Something went wrong while ${tenses.continuous[verb]} your ${nouns}`,
    success: `${capitalize(nouns)} ${tenses.past[verb]}`,
  };
};

const handleAsyncAction = <T>(
  action: Promise<T>,
  actionType: ActionType,
  setState?: (isLoading: boolean) => void
): Promise<T> => {
  setState?.(true);

  const messages = getMessages(actionType);

  return action
    .then((result) => {
      addToast({
        color: 'success',
        title: messages.success,
      });

      return result;
    })
    .catch((error) => {
      console.error(error);

      addToast({
        color: 'danger',
        description: `Error details: ${getErrorMessage(error)}`,
        title: messages.error,
      });

      return Promise.reject();
    })
    .finally(() => {
      setState?.(false);
    });
};

export default handleAsyncAction;
