import { addToast } from '@heroui/react';
import capitalize from 'lodash.capitalize';

import getErrorMessage from './get-error-message';
import rollbar from './rollbar';

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

const tenses: Record<'continuous' | 'past', Record<string, string>> = {
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

const handleAsyncAction = async <T>(
  action: Promise<T>,
  actionType: ActionType,
  setState?: (isLoading: boolean) => void
): Promise<T> => {
  setState?.(true);

  const messages = getMessages(actionType);

  try {
    const result = await action;

    addToast({
      color: 'success',
      title: messages.success,
    });

    return result;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    rollbar.error(error instanceof Error ? error : new Error(errorMessage));
    console.error(error);

    addToast({
      color: 'danger',
      description: `Error details: ${errorMessage}`,
      title: messages.error,
    });

    throw error;
  } finally {
    setState?.(false);
  }
};

export default handleAsyncAction;
