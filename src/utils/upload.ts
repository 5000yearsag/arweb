import { uploadFile } from '@/services/ar-platform/api';

import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';

export const customUploadRequest = (url: string, options: RcCustomRequestOptions) => {
  const { file, onSuccess, onProgress, onError } = options;
  uploadFile(url, file, {
    onUploadProgress: ({ total, loaded }) => {
      onProgress?.({ percent: Number(Math.round((loaded / total) * 100).toFixed(2)) || 0 });
    },
  })
    .then((res) => {
      const { url, dimensions } = res || {};
      onSuccess?.({
        url,
        dimensions,
      });
    })
    .catch((e) => {
      onError?.(e);
    });
};
