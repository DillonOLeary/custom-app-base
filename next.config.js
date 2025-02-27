/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Set COPILOT_ENV to 'local' for CI testing if it's not already defined
    COPILOT_ENV:
      process.env.COPILOT_ENV ||
      (process.env.CI === 'true' ? 'local' : undefined),
    COPILOT_API_KEY: process.env.COPILOT_API_KEY,
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: '',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

// Log the environment configuration
console.log('Next.js env configuration:', {
  COPILOT_ENV: nextConfig.env.COPILOT_ENV,
  NODE_ENV: process.env.NODE_ENV,
  CI: process.env.CI,
});

module.exports = nextConfig;
