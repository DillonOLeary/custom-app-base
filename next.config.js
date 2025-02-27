/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    COPILOT_ENV: process.env.COPILOT_ENV,
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

module.exports = nextConfig;
