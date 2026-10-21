import getErrorMessage from './get-error-message';
import handleAsyncAction, { type ActionType } from './handle-async-action';

const runAction = async (action: Promise<unknown>, actionType: ActionType) => {
  try {
    await handleAsyncAction(action, actionType);

    return { ok: true as const };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false as const };
  }
};

export default runAction;
