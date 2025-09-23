import type { AsArray } from './interfaces';

export class SyncHook<T> {
    __callbacks: ((...args: AsArray<T>) => void)[] = [];

    tap(fn: (...args: AsArray<T>) => void) {
        this.__callbacks.push(fn);
    }

    call(...argsArr: AsArray<T>): void {
        this.__callbacks.forEach(function (callback) {
            /* eslint-disable-next-line prefer-spread */
            callback.apply(void 0, argsArr);
        });
    }
}
