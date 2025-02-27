import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toBeVisible(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveAttribute(attr: string, value?: string): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveValue(value?: string | string[] | number | null): R;
      toHaveFocus(): R;
      toBeRequired(): R;
      toBeInvalid(): R;
      toBeValid(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(htmlText: string): R;
      toHaveStyle(css: string | object): R;
      toHaveDescription(text: string | RegExp): R;
    }
  }
}
