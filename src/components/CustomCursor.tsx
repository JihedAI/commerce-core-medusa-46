import React, { useEffect, useRef, useState, useCallback } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

interface CursorState {
  isHovering: boolean;
  isClicking: boolean;
  speed: number;
}

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const eyeRef = useRef<SVGSVGElement>(null);
  const pupilRef = useRef<SVGCircleElement>(null);
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [pupilPosition, setPupilPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [state, setState] = useState<CursorState>({
    isHovering: false,
    isClicking: false,
    speed: 0
  });

  const lastPosition = useRef<CursorPosition>({ x: 0, y: 0 });
  const animationFrame = useRef<number>();

  // Easing function for smooth movement
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  // Calculate movement speed
  const calculateSpeed = useCallback((current: CursorPosition, previous: CursorPosition) => {
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    if (!cursorRef.current || !pupilRef.current) return;

    // Smooth cursor following with easing
    const newX = lerp(position.x, targetPosition.x, 0.15);
    const newY = lerp(position.y, targetPosition.y, 0.15);
    
    // Pupil follows with additional lag
    const pupilX = lerp(pupilPosition.x, targetPosition.x, 0.08);
    const pupilY = lerp(pupilPosition.y, targetPosition.y, 0.08);

    setPosition({ x: newX, y: newY });
    setPupilPosition({ x: pupilX, y: pupilY });

    // Calculate speed for micro reactions
    const currentSpeed = calculateSpeed({ x: newX, y: newY }, lastPosition.current);
    setState(prev => ({ ...prev, speed: currentSpeed }));
    lastPosition.current = { x: newX, y: newY };

    // Update cursor position
    cursorRef.current.style.transform = `translate3d(${newX - 20}px, ${newY - 20}px, 0)`;

    // Update pupil position relative to eye center
    const pupilOffsetX = (pupilX - newX) * 0.3;
    const pupilOffsetY = (pupilY - newY) * 0.3;
    pupilRef.current.style.transform = `translate(${Math.max(-3, Math.min(3, pupilOffsetX))}px, ${Math.max(-3, Math.min(3, pupilOffsetY))}px)`;

    animationFrame.current = requestAnimationFrame(animate);
  }, [position, targetPosition, pupilPosition, calculateSpeed]);

  // Mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setTargetPosition({ x: e.clientX, y: e.clientY });
  }, []);

  // Mouse enter handler for interactive elements
  const handleMouseEnter = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (target.matches('a, button, [role="button"], .cursor-hover, .hover\\:scale-105, [data-cursor-hover]')) {
      setState(prev => ({ ...prev, isHovering: true }));
    }
  }, []);

  // Mouse leave handler
  const handleMouseLeave = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (target.matches('a, button, [role="button"], .cursor-hover, .hover\\:scale-105, [data-cursor-hover]')) {
      setState(prev => ({ ...prev, isHovering: false }));
    }
  }, []);

  // Click handlers for blink effect
  const handleMouseDown = useCallback(() => {
    setState(prev => ({ ...prev, isClicking: true }));
  }, []);

  const handleMouseUp = useCallback(() => {
    setState(prev => ({ ...prev, isClicking: false }));
  }, []);

  useEffect(() => {
    // Start animation loop
    animationFrame.current = requestAnimationFrame(animate);

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Add hover detection for interactive elements
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, [animate, handleMouseMove, handleMouseDown, handleMouseUp, handleMouseEnter, handleMouseLeave]);

  // Dynamic styles based on state
  const getEyeScale = () => {
    if (state.isClicking) return 0.8;
    if (state.isHovering) return 1.2;
    return 1 + Math.min(state.speed * 0.01, 0.2);
  };

  const getStrokeWidth = () => {
    return state.isHovering ? 1.5 : 1;
  };

  const getPupilScale = () => {
    if (state.isClicking) return 0.3;
    return 1 + Math.min(state.speed * 0.005, 0.3);
  };

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
      style={{
        width: '40px',
        height: '40px',
        transform: 'translate3d(-50%, -50%, 0)',
      }}
    >
      <svg
        ref={eyeRef}
        width="40"
        height="40"
        viewBox="0 0 40 40"
        className="transition-all duration-200 ease-out"
        style={{
          transform: `scale(${getEyeScale()})`,
          opacity: state.isClicking ? 0.3 : 1,
        }}
      >
        {/* Eye outline */}
        <ellipse
          cx="20"
          cy="20"
          rx="18"
          ry="12"
          fill="none"
          stroke="white"
          strokeWidth={getStrokeWidth()}
          className="transition-all duration-200 ease-out"
          style={{
            filter: state.speed > 5 ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none',
          }}
        />
        
        {/* Pupil */}
        <circle
          ref={pupilRef}
          cx="20"
          cy="20"
          r="4"
          fill="white"
          className="transition-all duration-100 ease-out"
          style={{
            transform: `scale(${getPupilScale()})`,
            transformOrigin: 'center',
          }}
        />

        {/* Iris detail */}
        <circle
          cx="20"
          cy="20"
          r="7"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.6"
          className="transition-all duration-200 ease-out"
          style={{
            transform: pupilRef.current?.style.transform || 'translate(0, 0)',
          }}
        />

        {/* Motion trail effect */}
        {state.speed > 8 && (
          <g opacity="0.3">
            <ellipse
              cx="16"
              cy="20"
              rx="16"
              ry="10"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              className="animate-fade-out"
            />
          </g>
        )}
      </svg>

      {/* Additional glow effect for fast movement */}
      {state.speed > 10 && (
        <div
          className="absolute inset-0 rounded-full opacity-20 animate-fade-out"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
            transform: 'scale(1.5)',
          }}
        />
      )}
    </div>
  );
};

export default CustomCursor;