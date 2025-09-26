# Scene graph and Transform

_See https://infinitecanvas.cc/guide/lesson-003 for more detail_

## Transform
The common CSS transform modes, such as translate, scale, rotate and skew, can be done through matrices. Since it is only a 2D transformation, the matrix is 3 x 3.

The last row is also always going to (0, 0, 1).

```bash
| a | c | tx|
| b | d | ty|
| 0 | 0 | 1 |
```

However, there is more to learn before we actually transform.

## Local and world coordinates
The world coordinate system is consistent with the global axes and always stays the same no matter what transformation is done to the objects within it.

The local coordinate system depends on the object that is the base. It is also known as the model coordinate system.

## Scene graph
This is a data structure for organising and managing 2D/3D virtual scenes and is a directed acyclic graph.

It is useful to arrange these graphs through a parent-child relationship. Taking the solar system example from the tutorial, the head parent is the solar system, and within it, there is the sun and the earth orbit. That, in terms, holds the Earth and the moon orbit. The moon orbit then holds its own moon.

Using the `Shape` class from before, each shape might have a parent `shape` and `children` shapes.

The system is designed for each `Shape` to only have one parent. When appending a shape to a parent, we have to remove the previous connection to the old parent before replacing it.

Once the hierachy is set up, you can then use recursion to traverse down from the initial parent (and call the render method!).

## Alignment
To upload the 3 x 3 transformation matrix to the GPU;s uniform buffer, you have to align it for GPU consumption with proper memory alignment. 

Here's the code for the JS project:

```js
const { a, b, c, d, tx, ty } = this.worldTransform;

this.__uniformBuffer.setSubData(
    0,
    new Uint8Array(
        new Float32Array([
            a,  b,  0, PADDING,
            c,  d,  0, PADDING,
            tx, ty, 1, PADDING,
        ]).buffer,
    ),
);
```

The GPU expects to receive a vector4. The 3 x 3 matrix obviously does not meet the 4 component vector. To mitigate that, you insert the `PADDING` at the end of each entry.

Each row has to be 16-byte aligned. `float32` is 4 bytes so four of them is 16 bytes.

## Understanding the buffers
- Uniform buffer: Contains the transformation matrix for the particular circle. Its usage is `BufferUsage.UNIFORM`, which indicates that it is accessible to both vertex and fragment shaders.
- Instanced buffer: Stores specific properties unique to the instance. Fed into the `vertex` shader. This allows multiple copies of the same geometry (e.g. the circle shape) to be created with different properties.
- Fragment unit buffer: defines the unit quad that covers the circle. A unit quad is the entire normalized device coordinate space, starting from (-1, -1) to (1, 1). This quad is common to all shapes that you will draw on the canvas.
- Index buffer: defines the triangle topology and tells the GPU how to connect the vertices to form the triangles.
    ```
        Vertices:        Triangle 1:      Triangle 2:       // the winding order is counter-clockwise
        D(3) ---- C(2)   D(3) ---- C(2)   D(3) ---- C(2)
        |         |      |         |       |     /  |
        |         |      |         |       |    /   |
        |         |      |         |       |   /    |
        A(0) ---- B(1)   A(0) ---- B(1)   A(0) ---- B(1)

                        Indices: 0,1,2    Indices: 0,2,3
                        (A,B,C)           (A,C,D)
    ```

```js
this.__inputLayout = device.createInputLayout({
    vertexBufferDescriptors: [
    {
        arrayStride: 4 * 2,
        stepMode: VertexStepMode.VERTEX,    // this is the quad unit coordinates
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
                shaderLocation: 1,
                offset: 0,
                format: Format.F32_RG,      // grabs the first 2 sets of 4 bytes
            },
            {
                shaderLocation: 2,
                offset: 4 * 2,
                format: Format.F32_RG,      // grabs the next 2 after the offset
            },
            {
                shaderLocation: 3,
                offset: 4 * 4,
                format: Format.F32_RGBA,    // grabs the last 4 sets of 4 bytes
            },
        ],
    },
    // ...
]});
```

## GPU process flow
1. Vertex Shader receives:
   - Quad vertex positions (from fragUnitBuffer)
   - Circle properties (from instancedBuffer) - updated if the dirty flag is on
   - Transform matrix (from uniformBuffer) - this is processed every frame

2. Vertex Shader outputs:
   - Transformed quad vertices
   - Interpolated circle data for fragments

3. Rasterization (GPU Hardware):
   - Converts triangles to pixels
   - Interpolates vertex attributes across pixels
   - Generates fragments for each covered pixel

4. Fragment Shader receives:
   - Interpolated position within circle
   - Circle center, radius, color
   - Uses SDF to determine if pixel is inside circle and output the pixel's color

5. Result: Perfect circular shape rendered efficiently

## Update transform
The transformation matrix of a child node can be calculated by:
```bash
child's WorldTransform = parent's WorldTransform * child's LocalTransform
```
