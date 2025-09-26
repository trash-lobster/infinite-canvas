import { Shape } from "shapes";
import { Renderer } from "../plugins";
import { PluginContext } from "../plugins/interfaces";
import { AsyncParallelHook, SyncHook, traverse } from "../utils";
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
    __shapes: Shape[] = [];

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
            render: new SyncHook<[Shape]>(),
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
        this.__shapes.forEach((shape) => {
            // this is because the shape needs to recursively call its children to make sure that they are rendered as well
            traverse(shape, (s) => {
                hooks.render.call(s);
            })
        });
        hooks.endFrame.call();
    }

    resize(width: number, height: number) {
        const { hooks } = this.__pluginContext;
        hooks.resize.call(width, height);
    }

    destroy() {
        const { hooks } = this.__pluginContext;
        this.__shapes.forEach((shape) => 
            traverse(shape, (s) => {
                s.destroy();
            })
        );
        hooks.destroy.call();
    }

    getDOM() {
        return this.__pluginContext.canvas;
    }

    appendChild(shape: Shape) {
        this.__shapes.push(shape);
    }

    removeChild(shape: Shape) {
        const index = this.__shapes.indexOf(shape);
        if (index !== -1) {
            this.__shapes.splice(index, 1);
        }
    }

}