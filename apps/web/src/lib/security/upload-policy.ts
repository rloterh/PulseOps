import {
  ALLOWED_DOC_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
} from '@/lib/security/constants';
import { SafeError } from '@/lib/security/safe-error';

export type UploadCategory = 'image' | 'document';

const allowedByCategory: Record<UploadCategory, string[]> = {
  image: ALLOWED_IMAGE_MIME_TYPES,
  document: ALLOWED_DOC_MIME_TYPES,
};

export function validateUpload(
  file: File | null | undefined,
  category: UploadCategory,
) {
  if (!file) {
    throw new SafeError({
      code: 'UPLOAD_MISSING',
      userMessage: 'No file was provided.',
    });
  }

  if (file.size <= 0) {
    throw new SafeError({
      code: 'UPLOAD_EMPTY',
      userMessage: 'The selected file is empty.',
    });
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new SafeError({
      code: 'UPLOAD_TOO_LARGE',
      status: 413,
      userMessage: 'The file is too large.',
    });
  }

  const allowed = allowedByCategory[category];

  if (!allowed.includes(file.type)) {
    throw new SafeError({
      code: 'UPLOAD_TYPE_INVALID',
      status: 415,
      userMessage: 'This file type is not allowed.',
    });
  }
}

export function createSafeStorageName(input: {
  orgId: string;
  category: UploadCategory;
  extension: string;
}) {
  const random = crypto.randomUUID();
  return `${input.orgId}/${input.category}/${random}.${input.extension}`;
}
