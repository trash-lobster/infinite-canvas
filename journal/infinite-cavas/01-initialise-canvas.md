# Initialise canvas

_See https://infinitecanvas.cc/guide/lesson-001 for more detail_

On the web, if you want to render anything on the canvas, you have to decide on the rendering context, which is the interface that allows you to use a selected underlying graphics system.

## Choosing between graphics system

The available choices we have are `CanvasRenderingContext2D`, `WebGLRenderingContext` (and the extended `WebGL2RenderingContext`) and `GPUCanvasContext`.

Using 2D context to draw does take advantage of hardware acceleration but not all of its operation is performed using the GPU and we have no control over what is done with what. It also cannot render in 3D.

Using WebGL or WebGPU would offload the entire process to the GPU. Both of them rely on using fragment shaders and vertex shaders.

WebGPU uses one more shader, the compute shader. True to its name, it performs calculations.

CPU processes sequentially, while GPU processes in parallel. Applying the same code to different data in parallel is where GPU shines the most.

Manipulating multiple images will benefit from using the GPU directly, so we can use either WebGL or WebGPU (although WebGPU is now supported by all major browsers and has a much better API).

## Understanding the flow of the canvas and its plugin system

This is my first experience with plugin systems. I understand the benefit it offers, but not until now have I had the opportunity to see some code.

The plugin architecture offers software a lot of flexibility in terms of its functions. Aside from its core function, what you install as plugins will determine what else the software can do. Following a rigid interface and careful design will allow plugins to intergrate into the software. The software itself does not need to know in advance what the plugins do - it will just call the trigger function as needed.

It shares some traits with dependency injection, but differs in terms of the 'registration' of these functions. Plugin systems are far more flexible and lower in its coupling. It also does its registration of the application on runtime, and can be done separate from the software's initialisation.

The tutorial offers up a fantastic opportunity to learn (kepping in mind that the code is in turn based on `webpack`'s structure).

### `canvas` object

The core of the system is the `canvas` object.

```js
class Canvas {
    __instancePromise: Promise<this>;
    __pluginContext!: PluginContext;
    // ...
}
```

The constructor takes an instance of `CanvasConfig`. We will only consider the `canvas` component of the config for now. This is the actual DOM element that will be rendered. It then assigns an object to `__pluginContext` and initiises a series of `hooks`.

These `hooks` are a dictionary of `hook`s that will be called at different times.

- `init` is called at initialisation
- `initAsync` is called at initialisation as well, but asynchronously
- `beginFrame` holds members that will be called at the beginning of the rendering of an animation frame
- `endFrame` has members that will be called at the end of the animation frame rendering
- `destroy` members are called when the object is destroyed
- `resize` is triggered when the dimension of the canvas changes

`__instancePromise` is a `Promise`. The plugins are used here to register the hooks.

> ❗️Note that `__instancePromise` is assigned the results of an IIFE to ensure that the promise starts running immediately after being defined.

The `hooks` created earlier as part of the `__pluginContext` are registered here. Then, the initialisation call is made. `__instancePromise` is a `Promise` because `async` hooks for initialisation are also called here.

However, constructors in JS cannot support asynchronous operation and the `async` part of the constructor is not guaranteed to be completed before your next oepration. Not unless you do the following.

```js
get initialized() {
    return this.__instancePromise.then(() => this);
}
```

This will return the result of the async operation.

### `Renderer`

Another important part to understand is the plugin `Renderer`. The dependency `@antv/g-device-api` abstracts away the creation of the WebGL device and WebGPU device, but they are created in one of the hooks registered here. The reason behind the asynchronous nature of the initialisation is because of the swap chain creation, making the WebGPU creation asynchronous.

### Rendering loop

```js
const animate = () => {
    requestAnimationFrame(animate);
    canvas.render();
};
animate();
```

This is a standard approach to animation rendering. `requestAnimationFrame` is more performant than using `setTimeout`. `setTimeout` is subjected to whatever macrotask queue has going on, since the callback in the `setTimeout` function is pushed to the queue. This means that if you leave it with `setTimeout`, it can be adversely affected by other events. It can only guarantee that the callback will be invoked after the specified time.

`requestAnimationFrame` guarantees that the operation will occur during the render opportunities, a time that is dinstinct from the main event loop. This is when the main browser thread switches over to do UI work and 'paint' the page.

## How to use the `canvas`?

Ensure that you remember the asynchronous nature of the canvas, since the other operations depends on the rendering plugin to be ready.

The newer versions of JS will allow top level `await` statements, but the following would also work:

```js
import { Canvas } from "./canvas";

async function main() {
    const __canvas = document.querySelector('#c') as HTMLCanvasElement;

    const canvas = await new Canvas({
        canvas: __canvas,
    }).initialized;

    const animate = () => {
        requestAnimationFrame(animate);
        canvas.render();
    };
    animate();

    canvas.resize(500, 500);
    canvas.destroy();
}

main();
```
