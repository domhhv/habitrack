import { addToast } from '@heroui/react';

import { capitalize, getErrorMessage } from '@utils';

type ActionVerb = 'add' | 'update' | 'remove' | 'fetch' | 'upload';
type EntityNoun =
  | 'habit'
  | 'note'
  | 'occurrence'
  | 'trait'
  | 'account'
  | 'icon';

type ActionType = `${ActionVerb}_${EntityNoun}`;

const parseActionType = (
  actionType: ActionType
): {
  noun: string;
  verb: string;
} => {
  const [verb, noun] = actionType.split('_');

  return { noun, verb };
};

const getMessages = (actionType: ActionType) => {
  const { noun, verb } = parseActionType(actionType);

  const pastTense = verb.endsWith('e') ? `${verb}d` : `${verb}ed`;

  return {
    error: `Something went wrong while ${verb}ing your ${noun}`,
    success: `${capitalize(noun)} ${pastTense}`,
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
