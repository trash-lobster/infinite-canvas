import {
    BufferFrequencyHint,
    BufferUsage,
    Format,
    TextureUsage,
    TransparentWhite,
WebGLDeviceContribution,
WebGPUDeviceContribution,
} from '@antv/g-device-api';
import type { SwapChain, DeviceContribution, Device, Buffer, RenderPass, RenderTarget } from '@antv/g-device-api';
import type { Plugin, PluginContext } from './interfaces';

export class Renderer implements Plugin {
    __swapChain!: SwapChain;
    __device!: Device;
    __renderTarget: RenderTarget;
    __renderPass: RenderPass;
    __uniformBuffer: Buffer;

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

            this.__renderTarget = this.__device.createRenderTargetFromTexture(
                this.__device.createTexture({
                        format: Format.U8_RGBA_RT,
                        width,
                        height,
                        usage: TextureUsage.RENDER_TARGET,
                    }),
            );

            this.__uniformBuffer = this.__device.createBuffer({
                viewOrSize: new Float32Array([
                    width / devicePixelRatio,
                    height / devicePixelRatio,
                ]),
                usage: BufferUsage.UNIFORM,
                hint: BufferFrequencyHint.DYNAMIC,
            });
        });

        hooks.resize.tap((width : number, height : number) => {
            if (!devicePixelRatio) return;
            this.__swapChain.configureSwapChain(
                width * devicePixelRatio,
                height * devicePixelRatio,
            );

            if (this.__renderTarget) {
                this.__renderTarget.destroy();
                this.__renderTarget = this.__device.createRenderTargetFromTexture(
                    this.__device.createTexture({
                        format: Format.U8_RGBA_RT,
                        width: width * devicePixelRatio,
                        height: height * devicePixelRatio,
                        usage: TextureUsage.RENDER_TARGET,
                    }),
                );
            }
        });

        hooks.destroy.tap(() => {
            this.__renderTarget.destroy();
            this.__uniformBuffer.destroy();
            this.__device.destroy();
            this.__device.checkForLeaks();
        });

        hooks.beginFrame.tap(() => {
            const { width, height } = this.__swapChain.getCanvas();
            const onscreenTexture = this.__swapChain.getOnscreenTexture();

            this.__uniformBuffer.setSubData(
                0,
                new Uint8Array(
                new Float32Array([
                    width / devicePixelRatio,
                    height / devicePixelRatio,
                ]).buffer,
                ),
            );

            this.__device.beginFrame();

            this.__renderPass = this.__device.createRenderPass({
                colorAttachment: [this.__renderTarget],
                colorResolveTo: [onscreenTexture],
                colorClearColor: [TransparentWhite],
            });

            this.__renderPass.setViewport(0, 0, width, height);
        });

        hooks.endFrame.tap(() => {
            this.__device.submitPass(this.__renderPass);
            this.__device.endFrame();
        });

        hooks.render.tap((shape) => {
            shape.transform.updateTransform(
                shape.parent ? shape.parent.transform : IDENTITY_TRANSFORM,
            );
            shape.render(this.__device, this.__renderPass, this.__uniformBuffer);
        });
    }
}