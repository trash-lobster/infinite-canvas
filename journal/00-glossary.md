*Attribute* - Used to specify where in the buffer, the __position__ of the data that you are looking for, what __type__ it is, the __offset__ from the start of the buffer and the __number of bytes__ to get from one entry to another.

*Buffer* - an array of binary data. You can put anything in there. Works closely with attribute to make a buffer useful.

*Linking shaders* - to make the program aware of what shaders it is working with. First attach shaders to the program with `WebGLRenderingContext.attachShader(program, shader)`. Then, use `WebGLRenderingContext.linkProgram` to turn the program into a usable GLSL program.

*Shader program* - the program consists of both the vertex shader and the fragment shader. In WebGL, you need to call `WebGLRenderingContext.createProgram` to have the object ready before you can link the shaders.

*Texture* - array of data for random access, usually image data

*Uniforms* - global variables in the shader program

*Varyings* - a way for vertex shaders to pass data to a fragment shader - only the points covered in the vertex shader will be colored
