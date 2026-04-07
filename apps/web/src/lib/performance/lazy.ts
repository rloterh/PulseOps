export function shouldPreferLazyHydration({
  estimatedKb,
  aboveTheFold,
  interactive,
}: {
  estimatedKb: number;
  aboveTheFold: boolean;
  interactive: boolean;
}) {
  if (aboveTheFold && interactive) {
    return false;
  }

  return estimatedKb >= 40 || !aboveTheFold;
}
