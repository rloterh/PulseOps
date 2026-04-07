import { createSafeStorageName, validateUpload } from '@/lib/security/upload-policy';

function createFile(name: string, type: string, size: number) {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

describe('upload-policy', () => {
  it('accepts a valid image upload', () => {
    const file = createFile('avatar.png', 'image/png', 1024);

    expect(() => {
      validateUpload(file, 'image');
    }).not.toThrow();
  });

  it('rejects unsupported mime types', () => {
    const file = createFile('script.svg', 'image/svg+xml', 1024);

    expect(() => {
      validateUpload(file, 'image');
    }).toThrow();
  });

  it('builds a randomized storage path', () => {
    const storagePath = createSafeStorageName({
      orgId: 'org_123',
      category: 'document',
      extension: 'pdf',
    });

    expect(storagePath).toMatch(/^org_123\/document\/.+\.pdf$/);
    expect(storagePath).not.toContain('..');
  });
});
