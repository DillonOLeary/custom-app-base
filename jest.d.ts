/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />
/// <reference types="@types/testing-library__jest-dom" />

// This file ensures TypeScript recognizes the extended Jest matchers from jest-dom
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toBeVisible(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveAttribute(attr: string, value?: string): R;
      // Add any other custom matchers you're using
    }
  }
}