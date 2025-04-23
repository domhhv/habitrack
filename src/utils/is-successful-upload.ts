import type { UploadResult, SuccessfulUpload } from '@models';

const isSuccessfulUpload = (
  input: PromiseFulfilledResult<UploadResult>
): input is PromiseFulfilledResult<SuccessfulUpload> => {
  return input.value.status === 'success';
};

export default isSuccessfulUpload;
