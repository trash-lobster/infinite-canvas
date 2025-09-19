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

const canvas = document.querySelector('#c') as HTMLCanvasElement;
canvas.width = 400;
canvas.height = 300;

if (canvas) {
    const gl = canvas.getContext("webgl");
    
    if (gl) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        const vertexShaderSource = (document.querySelector("#vertex-shader-2d") as HTMLScriptElement)?.text;
        const fragmentShaderSource = (document.querySelector("#fragment-shader-2d") as HTMLScriptElement)?.text;
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (vertexShader && fragmentShader) {
            const program = createProgram(gl, vertexShader, fragmentShader);
            if (program) {
                const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
                const positionBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                const positions = [
                    0, 0,
                    0, 0.5,
                    0.7, 0,
                ];
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
                gl.useProgram(program);
                gl.enableVertexAttribArray(positionAttributeLocation); // take data and supply it to shader attribute

                // Bind the position buffer.
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                
                // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
                var size = 2;          // 2 components per iteration
                var type = gl.FLOAT;   // the data is 32bit floats
                var normalize = false; // don't normalize the data
                var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
                var offset = 0;        // start at the beginning of the buffer
                gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

                var primitiveType = gl.TRIANGLES;
                var count = 3;
                gl.drawArrays(primitiveType, offset, count);
            }
        }
    }
}

function createShader(gl : WebGLRenderingContext, type : GLenum, source : string) {
    const shader = gl.createShader(type);
    if (!shader) return;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    
    if (success) {
        return shader;
    }
    
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl : WebGLRenderingContext, vertexShader : WebGLShader, fragmentShader : WebGLShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}