'use client';

import React, { useEffect, useState } from 'react';
import { TokenGate } from '@/components/common/TokenGate';
import type { SearchParams } from '@/app/search-params';

/**
 * Special page for security testing that forces token validation
 */
export default function SecurityTestPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [securityModeEnabled, setSecurityModeEnabled] = useState(false);

  useEffect(() => {
    // Enable security test mode
    (window as any).SECURITY_TEST_MODE = true;
    setSecurityModeEnabled(true);

    console.log('Security test mode enabled on page mount');

    // Override environment variables
    if (!(window as any).process) {
      (window as any).process = {};
    }
    if (!(window as any).process.env) {
      (window as any).process.env = {};
    }

    // Force validation by setting these values
    (window as any).process.env.NODE_ENV = 'production';
    (window as any).process.env.NEXT_PUBLIC_TEST_MODE = 'false';
    (window as any).process.env.CI = 'false';
    (window as any).process.env.COPILOT_ENV = '';
    (window as any).process.env.ENFORCE_SDK_VALIDATION = 'true';

    console.log('Environment variables set for security testing:', {
      NODE_ENV: (window as any).process.env.NODE_ENV,
      NEXT_PUBLIC_TEST_MODE: (window as any).process.env.NEXT_PUBLIC_TEST_MODE,
      CI: (window as any).process.env.CI,
      COPILOT_ENV: (window as any).process.env.COPILOT_ENV,
      ENFORCE_SDK_VALIDATION: (window as any).process.env
        .ENFORCE_SDK_VALIDATION,
    });
  }, []);

  // Pass forceValidation=true to explicitly require a token regardless of environment
  return (
    <TokenGate searchParams={searchParams} forceValidation={true}>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Security Test Page</h1>
        <div className="bg-green-100 p-4 rounded-lg border border-green-500 mb-4">
          <p className="text-green-800 font-medium">
            ✅ Authentication successful!
          </p>
          <p className="text-sm mt-2">
            You are seeing this page because a valid token was provided.
          </p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-medium mb-2">Security Test Environment:</h2>
          <ul className="list-disc list-inside text-sm">
            <li>
              Security Test Mode: {securityModeEnabled ? 'Enabled' : 'Disabled'}
            </li>
            <li>Token Provided: {searchParams.token ? 'Yes' : 'No'}</li>
          </ul>
        </div>
      </div>
    </TokenGate>
  );
}
