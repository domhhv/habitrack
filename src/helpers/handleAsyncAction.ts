import { addToast } from '@heroui/react';
import { capitalizeFirstLetter, getErrorMessage } from '@utils';
import nlp from 'compromise';

type ActionVerb = 'add' | 'update' | 'remove' | 'fetch';
type EntityNoun = 'habit' | 'note' | 'occurrence' | 'trait' | 'account';

type ActionType = `${ActionVerb}_${EntityNoun}`;

const parseActionType = (
  actionType: ActionType
): {
  verb: string;
  noun: string;
} => {
  const [verb, noun] = actionType.split('_');

  return { verb, noun };
};

const getMessages = (actionType: ActionType) => {
  const { verb, noun } = parseActionType(actionType);

  const pastTense = nlp(verb).verbs().toPastTense().text();

  return {
    success: `${capitalizeFirstLetter(noun)} ${pastTense}`,
    error: `Something went wrong while ${verb}ing your ${noun}`,
  };
};

const handleAsyncAction = <T>(
  action: () => Promise<T>,
  actionType: ActionType,
  setState: (isLoading: boolean) => void
): Promise<T> => {
  setState(true);

  const messages = getMessages(actionType);

  return action()
    .then((result) => {
      addToast({
        title: messages.success,
        color: 'success',
      });

      return result;
    })
    .catch((error) => {
      console.error(error);

      addToast({
        title: messages.error,
        description: `Error details: ${getErrorMessage(error)}`,
        color: 'danger',
      });

      return Promise.reject();
    })
    .finally(() => {
      setState(false);
    });
};

export default handleAsyncAction;
