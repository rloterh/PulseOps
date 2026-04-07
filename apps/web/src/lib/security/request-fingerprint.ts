export interface RequestFingerprint {
  ip: string;
  userAgent: string;
  key: string;
}

export function getRequestFingerprint(headers: Headers): RequestFingerprint {
  const forwardedFor = headers.get('x-forwarded-for') ?? '';
  const realIp = headers.get('x-real-ip') ?? '';
  const userAgent = headers.get('user-agent') ?? '';

  const forwardedIp = forwardedFor.split(',')[0]?.trim();
  const ip = forwardedIp && forwardedIp.length > 0 ? forwardedIp : realIp || 'unknown';

  return {
    ip,
    userAgent,
    key: `${ip}:${userAgent.slice(0, 120)}`,
  };
}
