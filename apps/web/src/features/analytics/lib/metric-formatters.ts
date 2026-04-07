export function formatMetricNumber(value: number | null) {
  if (value === null) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-GB').format(value);
}

export function formatMetricPercent(value: number | null) {
  if (value === null) {
    return 'N/A';
  }

  return `${String(Math.round(value))}%`;
}

export function formatMetricMinutes(value: number | null) {
  if (value === null) {
    return 'N/A';
  }

  if (value < 60) {
    return `${String(Math.round(value))}m`;
  }

  const hours = value / 60;
  return `${hours.toFixed(hours >= 10 ? 0 : 1)}h`;
}

export function formatMetricDelta(delta: number | null, unit: 'count' | 'percent' | 'minutes') {
  if (delta === null || delta === 0) {
    return 'Flat vs previous period';
  }

  const prefix = delta > 0 ? '+' : '-';
  const absolute = Math.abs(delta);

  if (unit === 'percent') {
    return `${prefix}${String(Math.round(absolute))} pts vs previous period`;
  }

  if (unit === 'minutes') {
    return `${prefix}${formatMetricMinutes(absolute)} vs previous period`;
  }

  return `${prefix}${formatMetricNumber(absolute)} vs previous period`;
}
