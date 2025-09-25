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


## Update transform
The transformation matrix of a child node can be calculated by:
```bash
child's WorldTransform = parent's WorldTransform * child's LocalTransform
```
