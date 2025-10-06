_Attribute_ - Used to specify where in the buffer, the **position** of the data that you are looking for, what **type** it is, the **offset** from the start of the buffer and the **number of bytes** to get from one entry to another. There is no chance for GLSL to have dynamic byte size since you have to define the data type when declaring. Attributes are only found in vertex shaders.

_Buffer_ - an array of binary data. You can put anything in there. Works closely with attribute to make a buffer useful.

_Clip space_ - A clip space is a special **cube** coordinate area. Each axis extends from -1 to 1, making the cube 2 unit sized. This space is then compressed down to 2D to display on screen. The vertex shader transforms data from their own coordinate system to this.

_Linking shaders_ - to make the program aware of what shaders it is working with. First attach shaders to the program with `WebGLRenderingContext.attachShader(program, shader)`. Then, use `WebGLRenderingContext.linkProgram` to turn the program into a usable GLSL program.

_Shader program_ - the program consists of both the vertex shader and the fragment shader. In WebGL, you need to call `WebGLRenderingContext.createProgram` to have the object ready before you can link the shaders.

_Texture_ - array of data for random access, usually image data

_Uniforms_ - global variables in the shader program

_Varyings_ - a way for vertex shaders to pass data to a fragment shader - only the points covered in the vertex shader will be colored
