import React, { useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface PolarizedSliderProps {
  imageUrl: string;
}

export default function PolarizedSlider({ imageUrl }: PolarizedSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const clip = useTransform(x, (value) => `inset(0 ${Math.max(0, value)}px 0 0)`);

  return (
    <section className="relative w-full h-[80vh] flex items-center justify-center bg-black overflow-hidden">
      <div ref={containerRef} className="relative w-full h-full max-w-7xl overflow-hidden rounded-2xl">
        {/* Normal Image */}
        <img src={imageUrl} alt="Normal view" className="absolute inset-0 w-full h-full object-cover select-none" />

        {/* Polarized Filtered Image */}
        <motion.div style={{ clipPath: clip }} className="absolute inset-0 overflow-hidden">
          <img
            src={imageUrl}
            alt="Polarized view"
            className="w-full h-full object-cover select-none"
            style={{
              filter: "contrast(1.4) saturate(1.2) brightness(0.9) hue-rotate(200deg)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#003049]/30 to-[#0a9396]/20 mix-blend-overlay" />
        </motion.div>

        {/* Draggable Divider */}
        <motion.div
          drag="x"
          dragConstraints={containerRef}
          style={{ x }}
          dragElastic={0.1}
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
          Sans lunettes
        </div>
        <div className="absolute right-6 top-6 bg-white/80 text-black text-xs md:text-sm px-3 py-1 rounded-full shadow">
          Avec filtre polarisé
        </div>
      </div>
    </section>
  );
}
