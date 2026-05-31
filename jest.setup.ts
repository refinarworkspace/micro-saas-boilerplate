import '@testing-library/jest-dom';

// ---------------------------------------------------------------------------
// jsdom polyfills used by the components under test
// ---------------------------------------------------------------------------

// next-themes reads matchMedia for system preference.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});

// Object URLs (image compressor, QR download, etc.)
if (typeof URL.createObjectURL === 'undefined') {
  // @ts-expect-error jsdom does not implement this
  URL.createObjectURL = jest.fn(() => 'blob:mock');
}
if (typeof URL.revokeObjectURL === 'undefined') {
  // @ts-expect-error jsdom does not implement this
  URL.revokeObjectURL = jest.fn();
}

// A permissive default fetch mock; individual tests can override it.
if (!('fetch' in globalThis) || typeof globalThis.fetch !== 'function') {
  // @ts-expect-error assigning a test double
  globalThis.fetch = jest.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({}),
  }));
}
