type LogLevel = 'info' | 'warn' | 'error';

interface LogPayload {
  message: string;
  context?: Record<string, unknown>;
}

export function log(level: LogLevel, payload: LogPayload) {
  const entry = {
    level,
    ...payload,
    timestamp: new Date().toISOString(),
  };

  if (level === 'error') {
    console.error(entry);
    return;
  }

  if (level === 'warn') {
    console.warn(entry);
    return;
  }

  console.info(entry);
}
