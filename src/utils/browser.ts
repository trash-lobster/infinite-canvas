export const isBrowser =
    typeof window !== 'undefined' && typeof window.document !== 'undefined';

/**
 * Different JS environment would have different global object syntax.
 *
 * `globalThis` is preferred.
 *
 * `this` is not defined under strict mode in modules and functions, so we want to avoid it altogether.
 *
 * In Node, only `global` will work.
 */
export const getGlobalThis = (): typeof globalThis => {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof self !== 'undefined') return self;
    if (typeof window !== 'undefined') return window;
    // @ts-ignore
    if (typeof global !== 'undefined') return global;
    // @ts-ignore
    return {};
};
