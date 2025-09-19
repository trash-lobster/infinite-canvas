// import {
//   WebGLDeviceContribution,
//   WebGPUDeviceContribution,
// } from '@antv/g-device-api';
// import type { SwapChain, DeviceContribution, Device } from '@antv/g-device-api';

// export class Renderer {
//     #swapChain: SwapChain;
//     #device: Device;

//     constructor() {
//     }

//     apply(context: any) {
//         const { hooks, canvas, renderer } = context;

//         hooks.initAsync.tapPromise(async () => {
//         let deviceContribution: DeviceContribution;
//         if (renderer === 'webgl') {
//             deviceContribution = new WebGLDeviceContribution({});
//         } else {
//             deviceContribution = new WebGPUDeviceContribution({});
//         }
//             const { width, height } = canvas;
//             const swapChain = await deviceContribution.createSwapChain(canvas);
//             swapChain.configureSwapChain(width, height);

//             this.#swapChain = swapChain;
//             this.#device = swapChain.getDevice();
//         });
//     }
// }