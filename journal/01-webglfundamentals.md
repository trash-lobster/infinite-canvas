# To render anything through WebGL
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