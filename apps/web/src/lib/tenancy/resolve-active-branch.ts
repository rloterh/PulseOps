import type { BranchOption } from '@/features/shell/types/shell.types';

export function resolveActiveBranchId(
  branches: BranchOption[],
  preferredBranchId: string | null,
) {
  if (branches.length === 0) {
    return null;
  }

  if (preferredBranchId) {
    const preferredBranch = branches.find((branch) => branch.id === preferredBranchId);

    if (preferredBranch) {
      return preferredBranch.id;
    }
  }

  return branches.find((branch) => branch.isActive)?.id ?? branches[0]?.id ?? null;
}
