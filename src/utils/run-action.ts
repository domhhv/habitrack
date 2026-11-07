import capitalize from 'lodash.capitalize';

import type { ActionToast } from '@models';

import getErrorMessage from './get-error-message';
import rollbar from './rollbar';

type ActionVerb = 'add' | 'update' | 'remove' | 'fetch' | 'upload' | 'log';
type EntityNoun =
  | 'habit'
  | 'note'
  | 'occurrence'
  | 'stock'
  | 'trait'
  | 'account'
  | 'photo'
  | 'metric-value'
  | 'icon';

export type ActionType = `${ActionVerb}_${EntityNoun}`;

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

/**
 * Runs an action's work and returns its result with the toasts the submitting component shows.
 * `getExtraToasts` adds toasts derived from a successful result, shown before the success toast.
 */
const runAction = async <T>(
  action: Promise<T>,
  actionType: ActionType,
  getExtraToasts?: (value: T) => ActionToast[]
) => {
  const messages = getMessages(actionType);

  try {
    const value = await action;
    const toasts: ActionToast[] = [
      ...(getExtraToasts?.(value) ?? []),
      { title: messages.success, variant: 'success' },
    ];

    return { ok: true as const, toasts };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    rollbar.error(error instanceof Error ? error : new Error(errorMessage));
    console.error(error);

    const toasts: ActionToast[] = [
      {
        description: `Error details: ${errorMessage}`,
        title: messages.error,
        variant: 'danger',
      },
    ];

    return { error: errorMessage, ok: false as const, toasts };
  }
};

export default runAction;
