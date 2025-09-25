import { Circle } from "shapes";
import { Canvas } from "./canvas";

async function main() {
    const __canvas = document.querySelector('#c') as HTMLCanvasElement;

    const resize = (width: number, height: number) => {
        __canvas.width = width * window.devicePixelRatio;
        __canvas.height = height * window.devicePixelRatio;
        __canvas.style.width = `${width}px`;
        __canvas.style.height = `${height}px`;
        __canvas.style.outline = 'none';
        __canvas.style.padding = '0px';
        __canvas.style.margin = '0px';
    };
    resize(window.innerWidth, window.innerHeight);
        
    const canvas = await new Canvas({
        canvas: __canvas,
    }).initialized;

    const circle = new Circle({
        cx: 100,
        cy: 100,
        r: 100,
        fill: 'red',
        antiAliasingType: 3,
    });
    canvas.appendChild(circle);
    
    const animate = () => {
        requestAnimationFrame(animate);
        canvas.render();
    };
    animate();
    
    window.addEventListener('resize', () => {
        resize(window.innerWidth, window.innerHeight);
        canvas.resize(window.innerWidth, window.innerHeight);
    });
}

main();
