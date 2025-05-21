import type {
  Note,
  FailedUpload,
  NoteOfPeriod,
  UploadResult,
  SuccessfulUpload,
} from '@models';

export const isTruthy = <T>(value: T | null | undefined): value is T => {
  return Boolean(value);
};

export const isFulfilled = <T>(
  input: PromiseSettledResult<T>
): input is PromiseFulfilledResult<T> => {
  return input.status === 'fulfilled';
};

export const isRejected = (
  input: PromiseSettledResult<unknown>
): input is PromiseRejectedResult => {
  return input.status === 'rejected';
};

export const isNoteOfPeriod = (input: Note): input is NoteOfPeriod => {
  if ('occurrenceId' in input && input.occurrenceId !== null) {
    return false;
  }

  return 'periodKind' in input && 'periodDate' in input;
};

export const isFailedUpload = (
  input: PromiseFulfilledResult<UploadResult>
): input is PromiseFulfilledResult<FailedUpload> => {
  return input.value.status === 'error';
};

export const isSuccessfulUpload = (
  input: PromiseFulfilledResult<UploadResult>
): input is PromiseFulfilledResult<SuccessfulUpload> => {
  return input.value.status === 'success';
};
