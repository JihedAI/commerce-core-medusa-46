import React, { useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface PolarizedSliderProps {
  imageUrl: string;
}

export default function PolarizedSlider({ imageUrl }: PolarizedSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  // Transform x value to clip path - only allow dragging to the right (positive values)
  const clip = useTransform(x, (value) => {
    const clampedValue = Math.max(0, value); // Only allow positive values (dragging right)
    return `inset(0 ${clampedValue}px 0 0)`;
  });

  return (
    <section className="relative w-full h-[80vh] flex items-center justify-center bg-black overflow-hidden">
      <div ref={containerRef} className="relative w-full h-full max-w-7xl overflow-hidden rounded-2xl">
        {/* Normal Image (Background) */}
        <img src={imageUrl} alt="Normal view" className="absolute inset-0 w-full h-full object-cover select-none" />

        {/* Polarized Filtered Image (Revealed by dragging right) */}
        <motion.div style={{ clipPath: clip }} className="absolute inset-0 overflow-hidden">
          <img
            src={imageUrl}
            alt="Polarized view"
            className="w-full h-full object-cover select-none"
            style={{
              filter: "contrast(1.1) saturate(1.1) brightness(0.95) hue-rotate(180deg)",
            }}
          />
        </motion.div>

        {/* Draggable Divider - Starts in center and can only be dragged right */}
        <motion.div
          drag="x"
          dragConstraints={{
            left: 0,
            right: containerRef.current ? containerRef.current.offsetWidth / 2 : 500,
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

        {/* Labels - Correct positions for new layout */}
        <div className="absolute left-6 top-6 bg-white/80 text-black text-xs md:text-sm px-3 py-1 rounded-full shadow">
          Sans lunettes
        </div>
        <div className="absolute right-6 top-6 bg-white/80 text-black text-xs md:text-sm px-3 py-1 rounded-full shadow">
          Avec filtre polarisé
        </div>
      </div>
    </section>
  );
}
