import { NextResponse } from 'next/server';

export class SafeError extends Error {
  public readonly code: string;
  public readonly userMessage: string;
  public readonly status: number;
  public readonly expose: boolean;

  constructor(options: {
    code: string;
    userMessage: string;
    status?: number;
    expose?: boolean;
    message?: string;
  }) {
    super(options.message ?? options.userMessage);
    this.name = 'SafeError';
    this.code = options.code;
    this.userMessage = options.userMessage;
    this.status = options.status ?? 400;
    this.expose = options.expose ?? true;
  }
}

export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof SafeError && error.expose) {
    return error.userMessage;
  }

  return 'Something went wrong. Please try again.';
}

export function createSafeErrorResponse(
  error: unknown,
  options: {
    fallbackStatus?: number;
    headers?: HeadersInit;
  } = {},
) {
  const fallbackStatus = options.fallbackStatus ?? 500;
  const responseHeaders = options.headers ? { headers: options.headers } : {};

  if (error instanceof SafeError) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error), code: error.code },
      { status: error.status, ...responseHeaders },
    );
  }

  return NextResponse.json(
    { error: getSafeErrorMessage(error), code: 'INTERNAL_ERROR' },
    { status: fallbackStatus, ...responseHeaders },
  );
}
