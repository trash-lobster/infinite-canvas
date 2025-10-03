import { Shape } from "../shapes";
import { Renderer, CameraControl, type PluginContext, type GridImplementation, type CheckboardStyle } from "../plugins";
import { AsyncParallelHook, SyncHook, traverse, getGlobalThis } from "../utils";
import { Camera } from "./camera";

export interface CanvasConfig {
    canvas: HTMLCanvasElement;
    renderer?: 'webgl' | 'webgpu';
    shaderCompilerPath?: string;
    devicePixelRatio?: number;
}

export class Canvas {
    __instancePromise: Promise<this>;
    __pluginContext!: PluginContext;
    __rendererPlugin: Renderer;
    __shapes: Shape[] = [];
    __camera: Camera;

    get camera() {
        return this.__camera;
    }

    constructor(config: CanvasConfig) {
        const {
            canvas,
            renderer = 'webgl',
            shaderCompilerPath = '',
            devicePixelRatio,
        } = config;

        // get global this object
        const globalThis = getGlobalThis();
        const dpr = devicePixelRatio ?? globalThis.devicePixelRatio;

        const { width, height } = canvas;
        const camera = new Camera(width / dpr, height / dpr);
        this.__camera = camera;

        this.__pluginContext = {
          globalThis,
          canvas,
          renderer,
          shaderCompilerPath,
          devicePixelRatio: dpr,
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
          camera
        };
    
        this.__instancePromise = (async () => {
            const { hooks } = this.__pluginContext;
            this.__rendererPlugin = new Renderer();
            // register the hooks to the new renderer plug in we have created here
            [
                new CameraControl(), 
                this.__rendererPlugin
            ].forEach((plugin) => {
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
        this.__camera.projection(width, height);
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

    setGridImplementation(implementation: GridImplementation) {
        this.__rendererPlugin.setGridImplementation(implementation);
    }

    setCheckboardStyle(style: CheckboardStyle) {
        this.__rendererPlugin.setCheckboardStyle(style);
    }

}