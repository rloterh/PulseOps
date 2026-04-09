import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    ok: true,
    service: 'pulseops',
    timestamp: new Date().toISOString(),
  });
}
