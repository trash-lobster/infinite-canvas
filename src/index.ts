import { Canvas } from "./canvas";

async function main() {
    const __canvas = document.querySelector('#c') as HTMLCanvasElement;
    
    const canvas = await new Canvas({
        canvas: __canvas,
    }).initialized;
    
    const animate = () => {
        requestAnimationFrame(animate);
        canvas.render();
    };
    animate();
    
    canvas.resize(500, 500);
    canvas.destroy();
}

main();
