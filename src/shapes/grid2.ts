import {
    VertexStepMode,
    type Device,
    type InputLayout,
    type Program,
    type RenderPipeline,
    Format,
    RenderPass,
    Buffer,
    Bindings,
    PrimitiveTopology,
    BufferUsage,
    BufferFrequencyHint,
} from '@antv/g-device-api';
import { vert, frag } from '../shaders/grid2';
import { DataArray } from '../utils';

export class Grid2 {
    __program: Program;
    __pipeline: RenderPipeline;
    __inputLayout: InputLayout;
    __bindings: Bindings;
    __buffer: Buffer;

    __vertices = new DataArray();

    appendVertex(x: number, y: number) {
        this.__vertices.appendFloat(x).appendFloat(y);
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

            this.__inputLayout = device.createInputLayout({
                vertexBufferDescriptors: [
                    {
                        arrayStride: 4 * 2,
                        stepMode: VertexStepMode.VERTEX,
                        attributes: [
                            {
                                format: Format.F32_RG,
                                offset: 0,
                                shaderLocation: 0,
                            },
                        ],
                    },
                ],
                indexBufferFormat: null,
                program: this.__program,
            });

            this.__pipeline = device.createRenderPipeline({
                inputLayout: this.__inputLayout,
                program: this.__program,
                colorAttachmentFormats: [Format.U8_RGBA_RT],
                topology: PrimitiveTopology.TRIANGLE_STRIP,
            });

            this.__bindings = device.createBindings({
                pipeline: this.__pipeline,
                uniformBufferBindings: [
                    {
                        buffer: uniformBuffer,
                    },
                ],
            });

            this.__vertices.clear();

            this.appendVertex(-1, -1);
            this.appendVertex(-1, 1);
            this.appendVertex(1, -1);
            this.appendVertex(1, 1);

            const data = this.__vertices.bytes();
            if (this.__buffer) {
                this.__buffer.destroy();
            }
            const buffer = device.createBuffer({
                viewOrSize: data.byteLength,
                usage: BufferUsage.VERTEX,
                hint: BufferFrequencyHint.DYNAMIC,
            });
            this.__buffer = buffer;
            buffer.setSubData(0, data);
        }

        renderPass.setBindings(this.__bindings);
        renderPass.setPipeline(this.__pipeline);
        renderPass.setVertexInput(
            this.__inputLayout,
            [
                {
                    buffer: this.__buffer,
                },
            ],
            null
        );
        renderPass.draw(4);
    }

    destroy(): void {
        this.__program.destroy();
        this.__buffer.destroy();
        this.__pipeline.destroy();
        this.__inputLayout.destroy();
        this.__bindings.destroy();
    }
}
