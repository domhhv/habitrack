import type { FailedUpload, UploadResult } from '@models';

const isFailedUpload = (
  input: PromiseFulfilledResult<UploadResult>
): input is PromiseFulfilledResult<FailedUpload> => {
  return input.value.status === 'error';
};

export default isFailedUpload;
