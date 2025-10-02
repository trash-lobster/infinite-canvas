import * as d3 from 'd3-color';
import { Shape } from './shape';
import {
    type Device,
    type RenderPass,
    Bindings,
    Buffer,
    BufferFrequencyHint,
    BufferUsage,
    BlendMode,
    BlendFactor,
    ChannelWriteMask,
    Format,
    InputLayout,
    Program,
    RenderPipeline,
    VertexStepMode,
} from '@antv/g-device-api';
import { vert, frag } from '../shaders/sdf';
import { paddingMat3 } from 'utils';

export enum AntiAliasingType {
    NONE,
    SMOOTHSTEP,
    DIVIDE,
    FWIDTH,
}

export class Circle extends Shape {
    __program: Program;
    __fragUnitBuffer: Buffer;
    __instancedBuffer: Buffer;
    __indexBuffer: Buffer;
    __pipeline: RenderPipeline;
    __inputLayout: InputLayout;
    __bindings: Bindings;
    
    __cx: number;
    __cy: number;
    __r: number;
    __fill: string;
    __fillRGB: d3.RGBColor;
    __antiAliasingType = AntiAliasingType.NONE;
    __uniformBuffer: Buffer;

    __name : string;

    constructor(
        config: Partial<{
            cx: number;
            cy: number;
            r: number;
            fill: string;
            antiAliasingType: AntiAliasingType;
        }> = {},
        name: string
    ) {
        super();

        const { cx, cy, r, fill, antiAliasingType } = config;

        this.cx = cx ?? 0;
        this.cy = cy ?? 0;
        this.r = r ?? 0;
        this.fill = fill ?? 'black';
        this.__antiAliasingType = antiAliasingType;
        this.__name = name;
    }


    get cx() {
        return this.__cx;
    }

    set cx(cx: number) {
        if (this.__cx !== cx) {
            this.__cx = cx;
            this.renderDirtyFlag = true;
        }
    }

    get cy() {
        return this.__cy;
    }

    set cy(cy: number) {
        if (this.__cy !== cy) {
            this.__cy = cy;
            this.renderDirtyFlag = true;
        }
    }

    get r() {
        return this.__r;
    }

    set r(r: number) {
        if (this.__r !== r) {
            this.__r = r;
            this.renderDirtyFlag = true;
        }
    }

    get fill() {
        return this.__fill;
    }

    set fill(fill: string) {
        if (this.__fill !== fill) {
        this.__fill = fill;
        this.__fillRGB = d3.rgb(fill);
        this.renderDirtyFlag = true;
        }
    }

    render(device: Device, renderPass: RenderPass, uniformBuffer: Buffer) {
        if (!this.__program) {
            this.__program = device.createProgram({
                vertex: {
                    glsl: vert,
                },
                fragment: {
                    glsl: frag,
                },
            });

            this.__uniformBuffer = device.createBuffer({
                viewOrSize: Float32Array.BYTES_PER_ELEMENT * 16, // mat4
                usage: BufferUsage.UNIFORM,
                hint: BufferFrequencyHint.DYNAMIC,
            });

            // allow you to draw multiple copies of the same geometry with different properties
            this.__instancedBuffer = device.createBuffer({
                viewOrSize: Float32Array.BYTES_PER_ELEMENT * 8,
                usage: BufferUsage.VERTEX,
                hint: BufferFrequencyHint.DYNAMIC,
            });

            // defines a unit quad to rasterize fragments on
            this.__fragUnitBuffer = device.createBuffer({
                viewOrSize: new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]),
                usage: BufferUsage.VERTEX,
                hint: BufferFrequencyHint.STATIC,
            });

            // tells the GPU how to split the four vertices into two triangles
            this.__indexBuffer = device.createBuffer({
                viewOrSize: new Uint32Array([0, 1, 2, 0, 2, 3]),
                usage: BufferUsage.INDEX,
                hint: BufferFrequencyHint.STATIC,
            });

            // dictates how the buffer should be read and what the instance buffer data represents
            this.__inputLayout = device.createInputLayout({
                vertexBufferDescriptors: [
                {
                    arrayStride: 4 * 2,
                    stepMode: VertexStepMode.VERTEX,
                    attributes: [
                        {
                            shaderLocation: 0,
                            offset: 0,
                            format: Format.F32_RG,
                        },
                    ],
                },
                {
                    arrayStride: 4 * 8,
                    stepMode: VertexStepMode.INSTANCE,
                    attributes: [
                        {
                            shaderLocation: 1,          // circle center
                            offset: 0,
                            format: Format.F32_RG,
                        },
                        {
                            shaderLocation: 2,          // circle radius
                            offset: 4 * 2,
                            format: Format.F32_RG,
                        },
                        {
                            shaderLocation: 3,          // circle color
                            offset: 4 * 4,
                            format: Format.F32_RGBA,
                        },
                    ],
                },
                ],
                indexBufferFormat: Format.U32_R,
                program: this.__program,
            });

            this.__pipeline = device.createRenderPipeline({
                inputLayout: this.__inputLayout,
                program: this.__program,
                colorAttachmentFormats: [Format.U8_RGBA_RT],
                megaStateDescriptor: {
                attachmentsState: [
                    {
                    channelWriteMask: ChannelWriteMask.ALL,
                    rgbBlendState: {
                        blendMode: BlendMode.ADD,
                        blendSrcFactor: BlendFactor.SRC_ALPHA,
                        blendDstFactor: BlendFactor.ONE_MINUS_SRC_ALPHA,
                    },
                    alphaBlendState: {
                        blendMode: BlendMode.ADD,
                        blendSrcFactor: BlendFactor.ONE,
                        blendDstFactor: BlendFactor.ONE_MINUS_SRC_ALPHA,
                    },
                    },
                ],
                },
            });

            this.__bindings = device.createBindings({
                pipeline: this.__pipeline,
                uniformBufferBindings: [
                    { buffer: uniformBuffer },          // scene uniforms (scree size, etc.)
                    { buffer: this.__uniformBuffer },   // shape transform matrix
                ],
            });
        }

        this.__uniformBuffer.setSubData(
            0,
            new Uint8Array(
                new Float32Array(paddingMat3(this.worldTransform.toArray(true))).buffer,
            ),
        );

        if (this.renderDirtyFlag) {
            console.log(`${this.__name} is re-rendering`);
            this.__instancedBuffer.setSubData(
                0,
                new Uint8Array(
                    new Float32Array([
                        this.__cx, this.__cy,
                        this.__r, this.__r,
                        this.__fillRGB.r / 255,
                        this.__fillRGB.g / 255,
                        this.__fillRGB.b / 255,
                        this.__fillRGB.opacity,
                    ]).buffer,
                ),
            );
        }

        renderPass.setPipeline(this.__pipeline);
        renderPass.setVertexInput(
            this.__inputLayout,
            [
                { buffer: this.__fragUnitBuffer },      // vertex positions (unit quad)
                { buffer: this.__instancedBuffer },     // per-instance data
            ],
            { buffer: this.__indexBuffer },             // triangle indices
        );
        renderPass.setBindings(this.__bindings);
        renderPass.drawIndexed(6, 1);

        this.renderDirtyFlag = false;
    }

    destroy(): void {
        this.__program.destroy();
        this.__instancedBuffer.destroy();
        this.__fragUnitBuffer.destroy();
        this.__indexBuffer.destroy();
        this.__uniformBuffer.destroy();
        this.__pipeline.destroy();
        this.__inputLayout.destroy();
        this.__bindings.destroy();
    }
}
