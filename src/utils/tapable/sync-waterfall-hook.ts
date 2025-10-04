import type { AsArray } from './interfaces';

// add callback and allow them to be called sequentially
export class SyncWaterfallHook<T, R> {
    __callbacks: ((...args: AsArray<T>) => R)[] = [];

    tap(fn: (...args: AsArray<T>) => R) {
        this.__callbacks.push(fn);
    }

    call(...argsArr: AsArray<T>): T | null {
        if (this.__callbacks.length) {
            let result = this.__callbacks[0].apply(void 0, argsArr);
            
            for (let i = 0; i < this.__callbacks.length - 1; i++) {
                const callback = this.__callbacks[i];
                result = callback(...(result as AsArray<T>));
            }

            return result;
        }

        return null;
    }
}
