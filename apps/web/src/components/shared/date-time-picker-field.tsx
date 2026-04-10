'use client';

import { useEffect, useId, useRef, useState } from 'react';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

type DateTimePickerVariant = 'reported' | 'due';

interface QuickAction {
  label: string;
  description: string;
  resolve(): Date;
}

const VARIANT_CONFIG: Record<
  DateTimePickerVariant,
  {
    eyebrow: string;
    placeholder: string;
    helper: string;
    quickActions: QuickAction[];
  }
> = {
  reported: {
    eyebrow: 'Incident timing',
    placeholder: 'Choose when the issue was first raised',
    helper: 'Capture the first trusted report so the response timeline starts cleanly.',
    quickActions: [
      {
        label: 'Now',
        description: 'Use the current time',
        resolve: () => roundMinutes(new Date(), 5),
      },
      {
        label: '30m ago',
        description: 'Backdate to a recent call-in',
        resolve: () => roundMinutes(new Date(Date.now() - 30 * 60 * 1000), 5),
      },
      {
        label: '2h ago',
        description: 'Reflect a delayed escalation',
        resolve: () => roundMinutes(new Date(Date.now() - 2 * 60 * 60 * 1000), 5),
      },
    ],
  },
  due: {
    eyebrow: 'Target timing',
    placeholder: 'Set a clear operational deadline',
    helper: 'Use a concrete target so the queue, dashboards, and SLAs stay aligned.',
    quickActions: [
      {
        label: 'In 2h',
        description: 'Short response window',
        resolve: () => roundMinutes(new Date(Date.now() + 2 * 60 * 60 * 1000), 5),
      },
      {
        label: 'Tomorrow 09:00',
        description: 'Next-day morning handoff',
        resolve: () => {
          const next = new Date();
          next.setDate(next.getDate() + 1);
          next.setHours(9, 0, 0, 0);
          return next;
        },
      },
      {
        label: 'Next workday',
        description: 'Default to 09:00 next weekday',
        resolve: () => getNextWeekdayAtHour(9),
      },
    ],
  },
};

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function parseLocalDateTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const [datePart, timePart = '00:00'] = value.split('T');
  if (!datePart) {
    return null;
  }

  const dateSegments = datePart.split('-');
  const timeSegments = timePart.split(':');

  if (dateSegments.length !== 3 || timeSegments.length < 2) {
    return null;
  }

  const year = Number(dateSegments[0]);
  const month = Number(dateSegments[1]);
  const day = Number(dateSegments[2]);
  const hours = Number(timeSegments[0]);
  const minutes = Number(timeSegments[1]);

  if (
    [year, month, day, hours, minutes].some((part) => Number.isNaN(part)) ||
    year < 1000 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function formatLocalDateTimeValue(date: Date) {
  return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function formatButtonLabel(value: string | null, placeholder: string) {
  const parsed = parseLocalDateTime(value);

  if (!parsed) {
    return placeholder;
  }

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

function formatPreviewLabel(value: string | null) {
  const parsed = parseLocalDateTime(value);

  if (!parsed) {
    return 'No date selected yet';
  }

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function roundMinutes(date: Date, step: number) {
  const next = new Date(date);
  next.setSeconds(0, 0);
  next.setMinutes(Math.round(next.getMinutes() / step) * step);
  return next;
}

function getDefaultSeedDate(variant: DateTimePickerVariant) {
  if (variant === 'reported') {
    return roundMinutes(new Date(), 5);
  }

  return roundMinutes(new Date(Date.now() + 2 * 60 * 60 * 1000), 5);
}

function getNextWeekdayAtHour(hour: number) {
  const next = new Date();
  next.setDate(next.getDate() + 1);

  while (next.getDay() === 0 || next.getDay() === 6) {
    next.setDate(next.getDate() + 1);
  }

  next.setHours(hour, 0, 0, 0);
  return next;
}

function buildCalendarDays(displayMonth: Date) {
  const monthStart = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
  const mondayOffset = (monthStart.getDay() + 6) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const next = new Date(gridStart);
    next.setDate(gridStart.getDate() + index);
    return next;
  });
}

function getActiveDate(value: string | null, variant: DateTimePickerVariant) {
  return parseLocalDateTime(value) ?? getDefaultSeedDate(variant);
}

function setDatePart(value: string | null, nextDate: Date, variant: DateTimePickerVariant) {
  const current = getActiveDate(value, variant);
  const next = new Date(
    nextDate.getFullYear(),
    nextDate.getMonth(),
    nextDate.getDate(),
    current.getHours(),
    current.getMinutes(),
    0,
    0,
  );

  return formatLocalDateTimeValue(next);
}

function setTimePart(
  value: string | null,
  nextTime: {
    hours?: number;
    minutes?: number;
  },
  variant: DateTimePickerVariant,
) {
  const current = getActiveDate(value, variant);
  const next = new Date(current);

  if (typeof nextTime.hours === 'number') {
    next.setHours(nextTime.hours);
  }

  if (typeof nextTime.minutes === 'number') {
    next.setMinutes(nextTime.minutes);
  }

  next.setSeconds(0, 0);
  return formatLocalDateTimeValue(next);
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path
        d="M7 2.75a.75.75 0 0 1 .75.75v1h8.5v-1a.75.75 0 0 1 1.5 0v1h.75A2.5 2.5 0 0 1 21 7v11.25a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.25V7A2.5 2.5 0 0 1 5.5 4.5h.75v-1A.75.75 0 0 1 7 2.75ZM4.5 9.5v8.75c0 .552.448 1 1 1h13a1 1 0 0 0 1-1V9.5h-15Zm1-3.5a1 1 0 0 0-1 1V8h15v-1a1 1 0 0 0-1-1h-13Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        d={
          direction === 'left'
            ? 'M14.78 5.72a.75.75 0 0 1 0 1.06L9.56 12l5.22 5.22a.75.75 0 1 1-1.06 1.06l-5.75-5.75a.75.75 0 0 1 0-1.06l5.75-5.75a.75.75 0 0 1 1.06 0Z'
            : 'M9.22 5.72a.75.75 0 0 0 0 1.06L14.44 12l-5.22 5.22a.75.75 0 1 0 1.06 1.06l5.75-5.75a.75.75 0 0 0 0-1.06l-5.75-5.75a.75.75 0 0 0-1.06 0Z'
        }
        fill="currentColor"
      />
    </svg>
  );
}

export function DateTimePickerField({
  id,
  name,
  defaultValue = '',
  variant = 'due',
  allowClear = true,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  variant?: DateTimePickerVariant;
  allowClear?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(defaultValue || '');
  const panelId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedDate = parseLocalDateTime(value);
  const [displayMonth, setDisplayMonth] = useState(
    selectedDate ?? getDefaultSeedDate(variant),
  );
  const config = VARIANT_CONFIG[variant];

  useEffect(() => {
    setValue(defaultValue || '');
    setDisplayMonth(parseLocalDateTime(defaultValue) ?? getDefaultSeedDate(variant));
  }, [defaultValue, variant]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const hoursValue = pad((selectedDate ?? getDefaultSeedDate(variant)).getHours());
  const minutesValue = pad((selectedDate ?? getDefaultSeedDate(variant)).getMinutes());
  const calendarDays = buildCalendarDays(displayMonth);

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        id={id}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => {
          setIsOpen((current) => !current);
        }}
        className={`group flex min-h-14 w-full items-center justify-between rounded-[1.15rem] border px-4 py-3 text-left transition ${
          isOpen
            ? 'border-cyan-300/45 bg-[linear-gradient(135deg,rgba(8,18,32,0.98),rgba(10,73,99,0.34))] shadow-[0_20px_60px_rgba(8,145,178,0.18)]'
            : 'border-white/10 bg-[linear-gradient(135deg,rgba(2,6,23,0.36),rgba(15,23,42,0.3))] hover:border-white/18 hover:bg-[linear-gradient(135deg,rgba(6,11,25,0.48),rgba(15,23,42,0.38))]'
        }`}
      >
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/72">
            {config.eyebrow}
          </span>
          <span className={`mt-1 block truncate text-sm font-medium ${value ? 'text-white' : 'text-white/42'}`}>
            {formatButtonLabel(value || null, config.placeholder)}
          </span>
        </span>
        <span className="ml-4 flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/76 transition group-hover:bg-white/[0.1] group-hover:text-white">
          <CalendarIcon />
        </span>
      </button>

      {isOpen ? (
        <div
          id={panelId}
          role="dialog"
          aria-modal="false"
          className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-30 overflow-hidden rounded-[1.55rem] border border-white/10 bg-[linear-gradient(180deg,rgba(6,11,22,0.98),rgba(7,17,29,0.98))] shadow-[0_30px_90px_rgba(2,6,23,0.56)] backdrop-blur-xl"
        >
          <div className="border-b border-white/8 bg-[linear-gradient(135deg,rgba(17,24,39,0.82),rgba(8,47,73,0.52))] px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/70">
              {config.eyebrow}
            </p>
            <p className="mt-2 text-lg font-semibold text-white">{formatPreviewLabel(value || null)}</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/54">{config.helper}</p>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {config.quickActions.map((quickAction) => (
                <button
                  key={quickAction.label}
                  type="button"
                  onClick={() => {
                    const next = quickAction.resolve();
                    setValue(formatLocalDateTimeValue(next));
                    setDisplayMonth(next);
                  }}
                  className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-3 text-left transition hover:bg-white/[0.08]"
                >
                  <span className="block text-sm font-medium text-white">{quickAction.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-white/48">
                    {quickAction.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 px-5 py-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(15rem,0.9fr)]">
            <div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => {
                    setDisplayMonth(
                      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                    );
                  }}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <ChevronIcon direction="left" />
                </button>
                <p className="text-sm font-semibold text-white">{formatMonthLabel(displayMonth)}</p>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => {
                    setDisplayMonth(
                      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                    );
                  }}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <ChevronIcon direction="right" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-2">
                {WEEKDAY_LABELS.map((label) => (
                  <span
                    key={label}
                    className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white/34"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                  const isToday = isSameDay(day, new Date());
                  const isInActiveMonth = day.getMonth() === displayMonth.getMonth();

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      aria-label={new Intl.DateTimeFormat('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }).format(day)}
                      onClick={() => {
                        setValue((current) => setDatePart(current, day, variant));
                        setDisplayMonth(day);
                      }}
                      className={`relative flex aspect-square items-center justify-center rounded-[1rem] text-sm font-medium transition ${
                        isSelected
                          ? 'border border-cyan-200/45 bg-cyan-300/16 text-white shadow-[0_12px_32px_rgba(6,182,212,0.24)]'
                          : isInActiveMonth
                            ? 'border border-white/6 bg-white/[0.03] text-white/82 hover:bg-white/[0.08]'
                            : 'border border-transparent bg-transparent text-white/28 hover:bg-white/[0.04] hover:text-white/58'
                      }`}
                    >
                      <span>{day.getDate()}</span>
                      {isToday && !isSelected ? (
                        <span className="absolute bottom-1.5 size-1.5 rounded-full bg-cyan-300/90" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Time
                </p>
                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <label className="space-y-2">
                    <span className="text-xs text-white/48">Hour</span>
                    <select
                      aria-label="Hour"
                      value={hoursValue}
                      onChange={(event) => {
                        setValue((current) =>
                          setTimePart(
                            current,
                            { hours: Number(event.target.value) },
                            variant,
                          ),
                        );
                      }}
                      className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/18 px-4 text-sm text-white outline-none"
                    >
                      {Array.from({ length: 24 }, (_, index) => (
                        <option key={index} value={pad(index)}>
                          {pad(index)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <span className="pt-6 text-lg font-semibold text-white/44">:</span>

                  <label className="space-y-2">
                    <span className="text-xs text-white/48">Minute</span>
                    <select
                      aria-label="Minute"
                      value={minutesValue}
                      onChange={(event) => {
                        setValue((current) =>
                          setTimePart(
                            current,
                            { minutes: Number(event.target.value) },
                            variant,
                          ),
                        );
                      }}
                      className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/18 px-4 text-sm text-white outline-none"
                    >
                      {Array.from({ length: 60 }, (_, index) => (
                        <option key={index} value={pad(index)}>
                          {pad(index)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <p className="mt-3 text-xs leading-5 text-white/40">
                  Stored using your local browser time and submitted in the same format as the existing forms.
                </p>
              </div>

              <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Final selection
                </p>
                <p className="mt-2 text-sm font-medium text-white">{formatPreviewLabel(value || null)}</p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  {value ? value : 'No value will be sent until you choose a date and time.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {allowClear ? (
                  <button
                    type="button"
                    onClick={() => {
                      setValue('');
                    }}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/72 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Clear
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-slate-950 transition hover:opacity-92"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
