import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface PolarizedSliderProps {
  imageUrl: string;
}

export default function PolarizedSlider({ imageUrl }: PolarizedSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const x = useMotionValue(0);

  // Get container width on mount and resize
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);

      const handleResize = () => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.offsetWidth);
        }
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Clip path reveals the normal image from left to right
  const clip = useTransform(x, (value) => {
    const clampedValue = Math.max(0, Math.min(value, containerWidth / 2));
    return `inset(0 ${containerWidth / 2 - clampedValue}px 0 ${clampedValue}px)`;
  });

  return (
    <section className="relative w-full h-[80vh] flex items-center justify-center bg-black overflow-hidden">
      <div ref={containerRef} className="relative w-full h-full max-w-7xl overflow-hidden rounded-2xl">
        {/* Polarized Filtered Image (Left side) */}
        <div className="absolute inset-0 w-1/2 overflow-hidden">
          <img
            src={imageUrl}
            alt="Polarized view"
            className="w-full h-full object-cover select-none"
            style={{
              filter: "contrast(1.1) saturate(1.1) brightness(0.95) hue-rotate(180deg)",
            }}
          />
        </div>

        {/* Normal Image (Right side) */}
        <div className="absolute inset-0 w-full">
          <img src={imageUrl} alt="Normal view" className="w-full h-full object-cover select-none" />
        </div>

        {/* Revealing overlay for normal image */}
        <motion.div
          style={{
            clipPath: clip,
          }}
          className="absolute inset-0 overflow-hidden"
        >
          <img src={imageUrl} alt="Normal view" className="w-full h-full object-cover select-none" />
        </motion.div>

        {/* Draggable Divider - Starts in center and can be dragged left/right within bounds */}
        <motion.div
          drag="x"
          dragConstraints={{
            left: -containerWidth / 2,
            right: containerWidth / 2,
          }}
          style={{ x }}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          className="absolute top-0 bottom-0 w-1 bg-white/80 cursor-ew-resize z-10 flex items-center justify-center"
        >
          <div
            className={`w-6 h-6 rounded-full bg-white shadow-md border border-gray-300 ${
              isDragging ? "scale-110" : "scale-100"
            } transition-transform`}
          />
        </motion.div>

        {/* Labels */}
        <div className="absolute left-6 top-6 bg-white/80 text-black text-xs md:text-sm px-3 py-1 rounded-full shadow">
          Avec filtre polarisé
        </div>
        <div className="absolute right-6 top-6 bg-white/80 text-black text-xs md:text-sm px-3 py-1 rounded-full shadow">
          Sans lunettes
        </div>
      </div>
    </section>
  );
}
