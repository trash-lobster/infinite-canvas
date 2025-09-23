export class AsyncParallelHook<T> {
    __callbacks: ((...args: T[]) => Promise<void>)[] = [];

    getCallbacksNum() {
        return this.__callbacks.length;
    }

    tapPromise(fn: (...args: T[]) => Promise<void>) {
        this.__callbacks.push(fn);
    }

    promise(...args: T[]): Promise<void[]> {
        return Promise.all(
            this.__callbacks.map((callback) => {
                return callback(...args);
            }),
        );
    }
}
