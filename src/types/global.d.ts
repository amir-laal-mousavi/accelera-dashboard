declare global {
  interface Window {
    /**
     * Navigate to the auth page with a custom redirect URL
     * @param redirectUrl - URL to redirect to after successful authentication
     */
    navigateToAuth: (redirectUrl: string) => void;
  }
}

// Add stubs for test-only modules to prevent TS "module not found" errors during typecheck
declare module "vitest" {
  export const describe: any;
  export const it: any;
  export const test: any;
  export const expect: any;
  export const beforeAll: any;
  export const afterAll: any;
  export const beforeEach: any;
  export const afterEach: any;
  export const vi: any;
}

declare module "@testing-library/react" {
  export const render: any;
  export const screen: any;
  export const fireEvent: any;
  export const cleanup: any;
  export const act: any;
}

declare module "@testing-library/jest-dom/matchers" {
  export const toBeInTheDocument: any;
  export const toHaveTextContent: any;
  export const toBeVisible: any;
  export const toHaveAttribute: any;
  const matchers: any;
  export default matchers;
}

export {};