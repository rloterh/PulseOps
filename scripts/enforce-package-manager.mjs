const userAgent = process.env.npm_config_user_agent ?? '';

if (userAgent.includes('pnpm/')) {
  process.exit(0);
}

const attemptedClient = userAgent.split(' ')[0] || 'unknown package manager';

console.error(
  [
    'PulseOps uses pnpm for workspace installs.',
    `Detected: ${attemptedClient}`,
    'Use `corepack pnpm install` instead of `npm install`.',
    'If you already ran pnpm before, keep npm away from the existing pnpm-managed node_modules tree.',
  ].join('\n'),
);

process.exit(1);
