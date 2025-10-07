import React, { useState, useRef, useLayoutEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface PolarizedSliderProps {
  imageUrl: string;
}

export default function PolarizedSlider({ imageUrl }: PolarizedSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const w = containerRef.current.offsetWidth;
      setWidth(w);
      x.set(0); // Start centered
    }
  }, []);

  // Polarized area = right side, clip adjusts when dragging left
  const clip = useTransform(x, (value) => {
    const inset = Math.max(width / 2 + value, 0);
    return `inset(0 ${inset}px 0 0)`;
  });

  return (
    <section className="relative w-full h-[80vh] flex items-center justify-center bg-black overflow-hidden">
      <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-2xl">
        {/* Base (Normal) Image */}
        <img src={imageUrl} alt="Normal view" className="absolute inset-0 w-full h-full object-cover select-none" />

        {/* Polarized Image (realistic effect) */}
        <motion.div style={{ clipPath: clip }} className="absolute inset-0 overflow-hidden">
          <img
            src={imageUrl}
            alt="Polarized view"
            className="w-full h-full object-cover select-none"
            style={{
              filter: "contrast(1.1) saturate(1.05) brightness(0.93)",
            }}
          />
          {/* Subtle overlay to simulate glare reduction */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent mix-blend-overlay" />
        </motion.div>

        {/* Draggable Divider */}
        <motion.div
          drag="x"
          dragConstraints={{ left: -width / 2, right: 0 }}
          style={{ x }}
          dragElastic={0.1}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          className="absolute top-0 bottom-0 w-[2px] bg-white/80 cursor-ew-resize z-10 flex items-center justify-center"
        >
          <div
            className={`w-6 h-6 rounded-full bg-white shadow-md border border-gray-300 transition-transform ${
              isDragging ? "scale-110" : "scale-100"
            }`}
          />
        </motion.div>

        {/* Labels */}
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
