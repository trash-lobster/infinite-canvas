# WebGL fundamentals
1. You need to create a context with your canvas, passing in 'webgl'
    ```
    var gl = canvas.getContext("webgl");
    ```
2. Have the fragment and vertex shader code ready
    1. Create shader with `WebGLRenderingContext`
    2. Tell the shader what type of shader it is (VERTEX or FRAGMENT)
    3. Refer to the shader script and insert them into the shader object
    4. Compile the shader
3. Linked the shaders to the shader program

## Basic vertex shader
```glsl
attribute vec4 a_position;
    
// all shaders have a main function
void main() {
    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = a_position;
}
```
An attribute will receive data from a buffer. `a_position` being vec4 means that a_position has 4 components. 

WebGL will fill it from the buffer data first and automatically input the others if missing.

## Basic fragment shader
```glsl
precision mediump float;
 
void main() {
    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    gl_FragColor = vec4(1, 0, 0.5, 1);
}
```
Fragment shaders do not have a default precision so we need to state it outright. 

## Creating a buffer for initialization
```js
var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
```
Using the code above, we have located where in the vertex program the position attribute should be. While the program knows where to read the data from, we haven't associated it with a buffer to read from yet.

```js
const positionBuffer = gl.createBuffer();
```
Here, we have created a buffer.

```js
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
```
Bind points are the global variables within WebGL. Calling the function above allows us to attach a resource to the bind point (in this case, `ARRAY_BUFFER`).

```js
const positions = [...]
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
```
Because GLSL requires explict type definition and the vertex shader needs to know how to parse the buffer, the array must be of a certain size. `STATIC_DRAW` is used to hint at how we will use the data.

`bufferData` effectively copies the data from `positions` to the bind point.

## Rendering