`enableVertexAttribArray(index: GLuint)` - collect from the generic attribute array into a list of attribute arrays

`getAttribLocation(program : ShaderProgram, attributeName : string)` - finds the location of the attribute in the vertex shader. This should be done during initialisation, not render loop.

`viewport(x: GLint, y: GLint, width: GLsizei, height: GLsizei)` - `x` is the horizontal value of the lower-left corner of the origin of the **viewport**. `y` is the vertical value of the lower-left corner of the origin. `width` and `height` are the width and height of the viewport, default is set to dimensions of the canvas. This function is important for canvas resizing.

`vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)` -
