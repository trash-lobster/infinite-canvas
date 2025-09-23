import { Renderer } from "../plugins";
import { PluginContext } from "../plugins/interfaces";
import { AsyncParallelHook, SyncHook } from "../utils";
import { getGlobalThis } from "../utils/browser";

export interface CanvasConfig {
    canvas: HTMLCanvasElement;
    renderer?: 'webgl' | 'webgpu';
    shaderCompilerPath?: string;
    devicePixelRatio?: number;
}

export class Canvas {
    __instancePromise: Promise<this>;
    __pluginContext!: PluginContext;

    constructor(config: CanvasConfig) {
        const {
            canvas,
            renderer = 'webgl',
            shaderCompilerPath = '',
            devicePixelRatio,
        } = config;

        // get global this object
        const globalThis = getGlobalThis();

        this.__pluginContext = {
          globalThis,
          canvas,
          renderer,
          shaderCompilerPath,
          devicePixelRatio: devicePixelRatio ?? globalThis.devicePixelRatio,
          // at this point, no hooks are registered.
          hooks: {
            init: new SyncHook<[]>(),
            initAsync: new AsyncParallelHook<[]>(),
            beginFrame: new SyncHook<[]>(),
            endFrame: new SyncHook<[]>(),
            destroy: new SyncHook<[]>(),
            resize: new SyncHook<[number, number]>(),
          },
        };
    
        this.__instancePromise = (async () => {
            const { hooks } = this.__pluginContext;
            // register the hooks to the new renderer plug in we have created here
            [new Renderer()].forEach((plugin) => {
                plugin.apply(this.__pluginContext);
            });

            // ensure that the init callbacks are called
            hooks.init.call();
            await hooks.initAsync.promise();
            return this;
        })();
    }

    // must be called to ensure that the async instancePromise is fulfilled and returns the instance itself
    get initialized() {
        return this.__instancePromise.then(() => this);
    }

    render() {
        const { hooks } = this.__pluginContext;
        hooks.beginFrame.call();
        hooks.endFrame.call();
    }

    resize(width: number, height: number) {
        const { hooks } = this.__pluginContext;
        hooks.resize.call(width, height);
    }

    /**
     * Destroy the canvas.
     */
    destroy() {
        const { hooks } = this.__pluginContext;
        hooks.destroy.call();
    }

    getDOM() {
        return this.__pluginContext.canvas;
    }

}