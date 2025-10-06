# Draw circle

_See https://infinitecanvas.cc/guide/lesson-002 for more detail_

As shapes are going to be constantly added to the canvas, the creation of the shapes must be separate from the canvas creation.

To do so, the canvas needs to hold a list of shapes and add a `render` method to the hooks. This will be called every rendering loop.

> For now, the render is limited to shapes only.

The canvas also needs to add the `appendChild` and `removeChild` to store the data.

## Rendering with device

The class is very simple and only has `render` and `destory` methods.

These all spawn from a `SwapChain`, which sorts out the display of rendered frames to the screen. It swaps background and foreground screens around to prevent screen tearing

The `render` method receives a `device`, a `renderPass` and a `uniformBuffer`.

A `device` represents the GPU and what it can do. It can create shaders and send commands to the GPU. This is the main interface.

A `RenderPass` is an object that captures the start and end of a frame. The concept does not exist in WebGL, but it does in WebGPU. The universal concept covered by the `antv` API will abtract the operations.

The method accepts three parameters:

1. `colorAttachment` - this is the offscreen intermediate destination where the rendering operations are drawn, but not directly to screen
2. `colorResolveTo` - copies the rendered content to screen buffer and render the image (final destination)
3. `colorClearColor` - clears the screen to a specific colour

When rendering a `Shape`, it will take `device`, `renderPass` and `uniformBuffer`. The device for its GPU abstraction, renderPass issues commands to the device and make it draw. The buffer stores and shares global data common to all shapes.

## Shapes

We are starting with rendering circle. Here are some factors that we need to consider:

- WebGL coordination system works differently from canvas/svg. Notably point up on the y-axis is positive in WebGL, but the other around for canvas and svg space.
- WebGPU is also different - its y-axis start from 0, whereas WebGL starts at -1.
- The hardware abstraction we are using aligns with the canvas/svg.

How does the abstraction align these coordinates?

Ensure that canvas dimension as a Uniform and the position of the circle as an Attribute. Then divide the positon by the dimension to give a value within the range [0, 1]. Multiply it by 2 and minus 1 will give the value within the range [-1, 1].

This gives us the value within a normalized device coordinate. Flip it so that y-axis is negative when looking up.

## Signed Distance Functions (SDF)

Using SDF would reduce the number of vertex points needed significantly for a circle.

```glsl
float sdf_circle(vec2 p, float r) {
    return length(p) - r;
}

void main() {
    float distance = sdf_circle(v_FragCoord, 1.0);
    if (distance > 0.0) {
        discard;
    }
    outputColor = vec4(1.0, 0.0, 0.0, 1.0);
}
```

`sdf_circle` calculates whether the point `p`'s distance from the center of the circle given is measure against the radius. - If the result is positive, the point is outside of the circle.

- If the value is zero, the point is on the circle edge (and perfect for borders!).
- If the value is negative, the point is inside the circle (and could be filled with colours!).

Using SDF, there are fewer vertices, perfect curve and scalable.

## Antialiasing

The fragment shader, without any intervention, decides only to color or not color a pixel, with no transition inbetween.

### Smoothstep

One way to tackle antialiasing is through using `smoothstep`.

```glsl
float alpha = smoothstep(0.0, 0.01, -distance);

outputColor = v_FillColor;
outputColor.a *= alpha;
```

Problem with this approach is that the 'fading' of the edges take up a percentage of the space. (In the code above, the border would take up 1% of the space).

### Divide

Since we want crisp edges, the smoothness of the smoothstep is unnecessary and a divide can be used instead.

### Screen space derivative

Fragment shaders process every 2 x 2 grid at a time in a non-overlapping way. Using `fwidth` would detect the value change between adjacent pixels.

## Dirty flag

To prevent a series of changes from invoking an update each time, use a dirty flag to control the rendering.

Set the flag to true when you are ready to have `render` process the changes.
