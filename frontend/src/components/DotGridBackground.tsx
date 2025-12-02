import React, { useEffect, useRef } from 'react';

const DotGridBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let mouse = { x: -1000, y: -1000 };
        let dots: Dot[] = [];
        const spacing = 30; // Space between dots

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initDots();
        };

        class Dot {
            x: number;
            y: number;
            baseX: number;
            baseY: number;
            size: number;
            baseSize: number;
            color: string;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.baseX = x;
                this.baseY = y;
                this.baseSize = 1.5;
                this.size = this.baseSize;
                this.color = 'rgba(255, 255, 255, 0.15)'; // Faint white
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                // Mouse interaction (Spotlight effect)
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let maxDistance = 250;

                if (distance < maxDistance) {
                    // Increase size and opacity when near mouse
                    const scale = (maxDistance - distance) / maxDistance;
                    this.size = this.baseSize + (scale * 2); // Grow slightly
                    this.color = `rgba(255, 255, 255, ${0.15 + (scale * 0.5)})`; // Brighten
                } else {
                    this.size = this.baseSize;
                    this.color = 'rgba(255, 255, 255, 0.15)';
                }

                this.draw();
            }
        }

        const initDots = () => {
            dots = [];
            for (let x = 0; x < canvas.width; x += spacing) {
                for (let y = 0; y < canvas.height; y += spacing) {
                    dots.push(new Dot(x, y));
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < dots.length; i++) {
                dots[i].update();
            }
            requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none blur-[3px]" />;
};

export default DotGridBackground;
