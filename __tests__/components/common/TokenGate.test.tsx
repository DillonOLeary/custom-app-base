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

  test('throws error when token is missing and not in development environment', () => {
    // Mock process.env.NODE_ENV to not be 'development'
    const originalNodeEnv = process.env.NODE_ENV;
    // Use Object.defineProperty to override the read-only property
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production' });

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

    // Also test with empty string token
    expect(() => {
      render(
        <TokenGate searchParams={{ token: '' }}>
          <div>Protected Content</div>
        </TokenGate>,
      );
    }).toThrow('Session Token is required');

    // Test with undefined token explicitly
    expect(() => {
      render(
        <TokenGate searchParams={{ token: undefined }}>
          <div>Protected Content</div>
        </TokenGate>,
      );
    }).toThrow('Session Token is required');

    consoleErrorMock.mockRestore();
    // Restore the original NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv });
  });

  test('renders children when token is missing but in development environment', () => {
    // Mock process.env.NODE_ENV to be 'development'
    const originalNodeEnv = process.env.NODE_ENV;
    // Use Object.defineProperty to override the read-only property
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });

    const searchParams: SearchParams = {};
    const { getByText } = render(
      <TokenGate searchParams={searchParams}>
        <div>Protected Content</div>
      </TokenGate>,
    );

    expect(getByText('Protected Content')).toBeInTheDocument();

    // Also test with different empty token values
    const { getByText: getByText2 } = render(
      <TokenGate searchParams={{ token: '' }}>
        <div>Protected Content</div>
      </TokenGate>,
    );
    expect(getByText2('Protected Content')).toBeInTheDocument();

    // Test with empty search params
    const { getByText: getByText3 } = render(
      <TokenGate searchParams={{}}>
        <div>Protected Content</div>
      </TokenGate>,
    );
    expect(getByText3('Protected Content')).toBeInTheDocument();

    // Restore the original NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv });
  });

  test('handles different environment values correctly', () => {
    // Test with 'test' environment
    const originalNodeEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'test' });

    const { getByText } = render(
      <TokenGate searchParams={{}}>
        <div>Protected Content</div>
      </TokenGate>,
    );
    expect(getByText('Protected Content')).toBeInTheDocument();

    // Test with staging environment (should require token)
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'staging' });
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(
        <TokenGate searchParams={{}}>
          <div>Protected Content</div>
        </TokenGate>,
      );
    }).toThrow('Session Token is required');

    consoleErrorMock.mockRestore();
    Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv });
  });
});
