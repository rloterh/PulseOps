const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatDateTimeLabel(value: string | null) {
  if (!value) {
    return 'Not scheduled';
  }

  return DATE_TIME_FORMATTER.format(new Date(value));
}
