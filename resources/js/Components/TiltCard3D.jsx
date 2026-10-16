import React, { useRef, useState, useEffect } from 'react';

/**
 * TiltCard3D Component
 * Transforms any card into an interactive 3D object that tilts, glares,
 * and brings layers forward in 3D perspective space based on cursor physics.
 */
export default function TiltCard3D({
    children,
    className = '',
    style = {},
    maxTilt = 12,
    perspective = 1000,
    scale = 1.02,
    glare = true,
    glowColor = null,
    onClick,
}) {
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Normalized between -1 and 1
        const normX = (mouseX / width) * 2 - 1;
        const normY = (mouseY / height) * 2 - 1;

        // Calculate 3D tilt
        const rotateY = normX * maxTilt;
        const rotateX = -normY * maxTilt;

        setTilt({ x: rotateX, y: rotateY });

        if (glare) {
            setGlarePos({
                x: (mouseX / width) * 100,
                y: (mouseY / height) * 100,
                opacity: 0.28,
            });
        }
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTilt({ x: 0, y: 0 });
        if (glare) {
            setGlarePos((prev) => ({ ...prev, opacity: 0 }));
        }
    };

    const transformStyle = {
        transform: isHovered
            ? `perspective(${perspective}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${scale}, ${scale}, ${scale})`
            : `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
        transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style,
    };

    const glowStyle = glowColor && isHovered ? {
        boxShadow: `0 20px 40px -12px ${glowColor}50, 0 0 25px -4px ${glowColor}30`,
    } : {};

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{ ...transformStyle, ...glowStyle }}
            className={`relative preserve-3d group cursor-pointer ${className}`}
        >
            {/* Glare Reflection Layer */}
            {glare && (
                <div
                    className="absolute inset-0 rounded-[inherit] pointer-events-none z-30 transition-opacity duration-300 overflow-hidden"
                    style={{
                        opacity: glarePos.opacity,
                        background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 70%)`,
                    }}
                />
            )}

            {children}
        </div>
    );
}
