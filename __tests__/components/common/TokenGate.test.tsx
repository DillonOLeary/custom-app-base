import React from 'react';
import { render } from '@testing-library/react';
import { TokenGate } from '@/components/common/TokenGate';
import { SearchParams } from '@/app/search-params';

describe('TokenGate', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('renders children when token is present', () => {
    const searchParams: SearchParams = { token: 'test-token' };
    const { getByText } = render(
      <TokenGate searchParams={searchParams}>
        <div>Protected Content</div>
      </TokenGate>,
    );

    expect(getByText('Protected Content')).toBeInTheDocument();
  });

  test('throws error when token is missing and not in local environment', () => {
    // Mock process.env.COPILOT_ENV to not be 'local'
    process.env.COPILOT_ENV = 'production';

    const searchParams: SearchParams = {};

    // We need to catch the error to prevent test from failing
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(
        <TokenGate searchParams={searchParams}>
          <div>Protected Content</div>
        </TokenGate>,
      );
    }).toThrow('Session Token is required');

    consoleErrorMock.mockRestore();
  });

  test('renders children when token is missing but in local environment', () => {
    // Mock process.env.COPILOT_ENV to be 'local'
    process.env.COPILOT_ENV = 'local';

    const searchParams: SearchParams = {};
    const { getByText } = render(
      <TokenGate searchParams={searchParams}>
        <div>Protected Content</div>
      </TokenGate>,
    );

    expect(getByText('Protected Content')).toBeInTheDocument();
  });
});
