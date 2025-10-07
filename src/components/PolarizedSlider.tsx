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

  // Measure container width once mounted
  useLayoutEffect(() => {
    if (containerRef.current) {
      const w = containerRef.current.offsetWidth;
      setWidth(w);
      x.set(0); // start centered (polarized on right)
    }
  }, []);

  // Compute clip path dynamically
  const clip = useTransform(x, (value) => {
    // value is negative when dragging left
    const inset = Math.max(width / 2 + value, 0);
    return `inset(0 ${inset}px 0 0)`;
  });

  return (
    <section className="relative w-full h-[80vh] flex items-center justify-center bg-black overflow-hidden">
      <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-2xl">
        {/* Left: Normal Image */}
        <img src={imageUrl} alt="Normal view" className="absolute inset-0 w-full h-full object-cover select-none" />

        {/* Right: Polarized Filter Overlay */}
        <motion.div style={{ clipPath: clip }} className="absolute inset-0 overflow-hidden">
          <img
            src={imageUrl}
            alt="Polarized view"
            className="w-full h-full object-cover select-none"
            style={{
              filter: "contrast(1.4) saturate(1.3) brightness(0.9) hue-rotate(190deg)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#004d7a]/30 to-[#00bf8f]/20 mix-blend-overlay" />
        </motion.div>

        {/* Draggable Divider */}
        <motion.div
          drag="x"
          dragConstraints={{
            left: -width / 2, // can drag left half only
            right: 0, // stop at center
          }}
          style={{ x }}
          dragElastic={0.1}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          className="absolute top-0 bottom-0 w-[2px] bg-white/80 cursor-ew-resize z-10 flex items-center justify-center"
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
