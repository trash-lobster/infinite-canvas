export const isBrowser =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';

export const getGlobalThis = (): typeof globalThis => {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof self !== 'undefined') return self;
    if (typeof window !== 'undefined') return window;
    // @ts-ignore
    if (typeof global !== 'undefined') return global;
    // @ts-ignore
    return {};
};
