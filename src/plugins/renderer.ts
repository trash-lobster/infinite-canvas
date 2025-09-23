import {
WebGLDeviceContribution,
WebGPUDeviceContribution,
} from '@antv/g-device-api';
import type { SwapChain, DeviceContribution, Device } from '@antv/g-device-api';
import type { Plugin, PluginContext } from './interfaces';

export class Renderer implements Plugin {
    __swapChain!: SwapChain;
    __device!: Device;

    // modifies the hooks of therender context passed in directly
    apply(context: PluginContext) {
        const { hooks, canvas, renderer, shaderCompilerPath, devicePixelRatio } =
        context;

        // swap chain creation is async
        hooks.initAsync.tapPromise(async () => {
            let deviceContribution: DeviceContribution;
            if (renderer === 'webgl') {
                deviceContribution = new WebGLDeviceContribution({
                targets: ['webgl2', 'webgl1'],
                antialias: true,
                shaderDebug: true,
                trackResources: true,
                onContextCreationError: () => {},
                onContextLost: () => {},
                onContextRestored(e) {},
                });
            } else {
                deviceContribution = new WebGPUDeviceContribution({
                    shaderCompilerPath,
                    onContextLost: () => {},
                });
            }

            const { width, height } = canvas;
            const swapChain = await deviceContribution.createSwapChain(canvas);
            swapChain.configureSwapChain(width, height);

            this.__swapChain = swapChain;
            this.__device = swapChain.getDevice();
        });

        hooks.resize.tap((width : number, height : number) => {
            if (!devicePixelRatio) return;
            this.__swapChain.configureSwapChain(
                width * devicePixelRatio,
                height * devicePixelRatio,
            );
        });

        hooks.destroy.tap(() => {
            this.__device.destroy();
        });

        hooks.beginFrame.tap(() => {
            this.__device.beginFrame();
        });

        hooks.endFrame.tap(() => {
            this.__device.endFrame();
        });
    }
}