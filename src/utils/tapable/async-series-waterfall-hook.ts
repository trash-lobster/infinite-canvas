import type { AsArray } from './interfaces';

export class AsyncSeriesWaterfallHook<T, R> {
    __callbacks: ((...args: AsArray<T>) => Promise<R>)[] = [];

    tapPromise(fn: (...args: AsArray<T>) => Promise<R>) {
        this.__callbacks.push(fn);
    }

    async promise(...args: AsArray<T>): Promise<R | null> {
        if (this.__callbacks.length) {
        let result: R = await this.__callbacks[0](...args);
        for (let i = 0; i < this.__callbacks.length - 1; i++) {
            const callback = this.__callbacks[i];
            // @ts-ignore
            result = await callback(result);
        }

        return result;
        }

        return null;
    }
}
