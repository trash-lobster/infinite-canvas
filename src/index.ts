// import { Canvas } from "./canvas/canvas";

// const canvas = new Canvas({
//     canvas: $canvas,
// });

// const animate = () => {
//     requestAnimationFrame(animate);
//     canvas.render();
// };
// animate();

// canvas.resize(500, 500);
// canvas.destroy();

// https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html
// https://infinitecanvas.cc/guide/lesson-001#devicepixelratio

const canvas = document.querySelector('#c') as HTMLCanvasElement;
canvas.width = 400;
canvas.height = 300;

if (canvas) {
    const gl = canvas.getContext("webgl");
    
    if (gl) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        const vertexShaderSource = (document.querySelector("#vertex-shader-2d") as HTMLScriptElement)?.text; // vertex shader code
        const fragmentShaderSource = (document.querySelector("#fragment-shader-2d") as HTMLScriptElement)?.text; // fragment shader code
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource); 
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource); 
        if (vertexShader && fragmentShader) {
            const program = createProgram(gl, vertexShader, fragmentShader); // create shader program
            if (program) {
                const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
                const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
                const colorUniformLocation = gl.getUniformLocation(program, "u_color");

                const positionBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                // const positions = [
                //     10, 20,
                //     80, 20,
                //     10, 50,
                //     40, 50,
                //     90, 20,
                //     100, 30,
                // ];
                // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
                // webglUtils.resizeCanvasToDisplaySize(gl.canvas);

                // Tell WebGL how to convert from clip space to pixels
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

                // Clear the canvas
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.useProgram(program);
                gl.enableVertexAttribArray(positionAttributeLocation); // take data and supply it to shader attribute

                // gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
                // Bind the position buffer.
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                
                // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
                var size = 2;          // 2 components per iteration
                var type = gl.FLOAT;   // the data is 32bit floats
                var normalize = false; // don't normalize the data
                var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
                var offset = 0;        // start at the beginning of the buffer
                gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

                  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

                for (var ii = 0; ii < 50; ++ii) {
                    // Setup a random rectangle
                    // This will write to positionBuffer because
                    // its the last thing we bound on the ARRAY_BUFFER
                    // bind point
                    setRectangle(
                        gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));
                
                    // Set a random color.
                    gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);
                
                    // Draw the rectangle.
                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                }
            }
        }
    }
}

function createShader(gl : WebGLRenderingContext, type : GLenum, source : string) {
    const shader = gl.createShader(type);
    if (!shader) return;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS); // returns information about the shader that you just created
    
    if (success) {
        return shader;
    }
    
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl : WebGLRenderingContext, vertexShader : WebGLShader, fragmentShader : WebGLShader) {
    const program = gl.createProgram();

    // attach existing shaders
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // creates an executable program on the GPU
    gl.linkProgram(program);
    
    // to check status of the program parameter
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function randomInt(range : number) {
  return Math.floor(Math.random() * range);
}
 
// Fills the buffer with the values that define a rectangle.
function setRectangle(gl: WebGLRenderingContext, x: number, y: number, width: number, height: number) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
 
  // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
  // whatever buffer is bound to the `ARRAY_BUFFER` bind point
  // but so far we only have one buffer. If we had more than one
  // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.
 
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2]), gl.STATIC_DRAW);
}