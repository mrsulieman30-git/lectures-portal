import React, { useRef, useEffect } from 'react';

/**
 * Interactive3DScene Component
 * Canvas-powered 3D interactive particle constellation and geometric polyhedra
 * that react smoothly to cursor coordinates and scroll depth.
 */
export default function Interactive3DScene({ className = '', height = '450px', interactive = true }) {
    const canvasRef = useRef(null);
    const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
        let heightPx = (canvas.height = canvas.parentElement?.offsetHeight || parseInt(height) || 450);

        const handleResize = () => {
            if (!canvas.parentElement) return;
            width = canvas.width = canvas.parentElement.offsetWidth;
            heightPx = canvas.height = canvas.parentElement.offsetHeight;
        };

        window.addEventListener('resize', handleResize);

        const handleMouseMove = (e) => {
            if (!interactive) return;
            const rect = canvas.getBoundingClientRect();
            mousePos.current.targetX = (e.clientX - rect.left - width / 2) * 0.0012;
            mousePos.current.targetY = (e.clientY - rect.top - heightPx / 2) * 0.0012;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // 3D Nodes Definition
        const NUM_NODES = 42;
        const nodes = [];
        for (let i = 0; i < NUM_NODES; i++) {
            nodes.push({
                x: (Math.random() - 0.5) * width * 0.85,
                y: (Math.random() - 0.5) * heightPx * 0.85,
                z: (Math.random() - 0.5) * 500,
                radius: Math.random() * 3 + 2,
                color: ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#3b82f6'][Math.floor(Math.random() * 5)],
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                vz: (Math.random() - 0.5) * 0.4,
            });
        }

        // 3D Floating Polyhedron (Cube / Octahedron Wireframe)
        const cubeVertices = [
            [-80, -80, -80], [80, -80, -80], [80, 80, -80], [-80, 80, -80],
            [-80, -80, 80], [80, -80, 80], [80, 80, 80], [-80, 80, 80]
        ];

        const cubeEdges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        let angleX = 0;
        let angleY = 0;

        // Render loop
        const render = () => {
            ctx.clearRect(0, 0, width, heightPx);

            // Interpolate mouse movement with damping
            mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
            mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

            angleX += 0.004 + mousePos.current.y * 0.5;
            angleY += 0.005 + mousePos.current.x * 0.5;

            const fov = 450;
            const centerX = width / 2;
            const centerY = heightPx / 2;

            // Project 3D point to 2D
            const project = (x, y, z) => {
                // Rotate around Y
                let cosY = Math.cos(angleY);
                let sinY = Math.sin(angleY);
                let x1 = x * cosY - z * sinY;
                let z1 = z * cosY + x * sinY;

                // Rotate around X
                let cosX = Math.cos(angleX);
                let sinX = Math.sin(angleX);
                let y2 = y * cosX - z1 * sinX;
                let z2 = z1 * cosX + y * sinX;

                let depth = fov / (fov + z2 + 250);
                return {
                    x: centerX + x1 * depth,
                    y: centerY + y2 * depth,
                    depth: depth,
                    z: z2,
                };
            };

            // Draw central 3D wireframe cube
            const projectedCube = cubeVertices.map(([x, y, z]) => project(x, y, z));

            ctx.lineWidth = 1.4;
            cubeEdges.forEach(([start, end]) => {
                const p1 = projectedCube[start];
                const p2 = projectedCube[end];
                const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
                gradient.addColorStop(1, 'rgba(236, 72, 153, 0.4)');
                ctx.strokeStyle = gradient;

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            });

            // Update & Draw 3D Floating Nodes
            nodes.forEach((node, i) => {
                node.x += node.vx;
                node.y += node.vy;
                node.z += node.vz;

                if (node.x > width / 2) node.x = -width / 2;
                if (node.x < -width / 2) node.x = width / 2;
                if (node.y > heightPx / 2) node.y = -heightPx / 2;
                if (node.y < -heightPx / 2) node.y = heightPx / 2;
                if (node.z > 250) node.z = -250;
                if (node.z < -250) node.z = 250;

                const p = project(node.x, node.y, node.z);

                // Draw connections between close nodes
                for (let j = i + 1; j < nodes.length; j++) {
                    const other = nodes[j];
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const dz = node.z - other.z;
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < 130) {
                        const pOther = project(other.x, other.y, other.z);
                        const alpha = (1 - dist / 130) * 0.25;
                        ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(pOther.x, pOther.y);
                        ctx.stroke();
                    }
                }

                // Draw node circle with glow
                const rad = Math.max(1, node.radius * p.depth * 1.5);
                ctx.fillStyle = node.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = node.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [height, interactive]);

    return (
        <div className={`relative overflow-hidden pointer-events-none ${className}`} style={{ height }}>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
}
