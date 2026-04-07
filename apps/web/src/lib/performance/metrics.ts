export function createPerformanceMarkName(scope: string, label: string) {
  return `pulseops:${scope.trim().toLowerCase()}:${label.trim().toLowerCase()}`;
}

export function markPerformance(name: string) {
  if (typeof performance === 'undefined' || typeof performance.mark !== 'function') {
    return false;
  }

  performance.mark(name);
  return true;
}

export function measurePerformance(input: {
  name: string;
  startMark: string;
  endMark: string;
}) {
  if (typeof performance === 'undefined' || typeof performance.measure !== 'function') {
    return false;
  }

  performance.measure(input.name, input.startMark, input.endMark);
  return true;
}
