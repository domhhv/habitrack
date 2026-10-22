import type {
  Note,
  FailedUpload,
  NoteOfPeriod,
  UploadResult,
  SuccessfulUpload,
  NoteOfOccurrence,
} from '@models';

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

export const isNoteOfOccurrence = (input: Note): input is NoteOfOccurrence => {
  return 'occurrenceId' in input && input.occurrenceId !== null;
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

const EMAIL_OTP_TYPES = [
  'email',
  'invite',
  'signup',
  'recovery',
  'magiclink',
  'email_change',
] as const;

export const isEmailOtpType = (
  input: string | null
): input is (typeof EMAIL_OTP_TYPES)[number] => {
  return EMAIL_OTP_TYPES.some((type) => {
    return type === input;
  });
};
