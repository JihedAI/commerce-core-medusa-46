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

  // Measure container width and center divider on load
  useLayoutEffect(() => {
    if (containerRef.current) {
      const w = containerRef.current.offsetWidth;
      setWidth(w);
      x.set(0);
    }
  }, []);

  // Compute clip so polarized part stays on right
  const clip = useTransform(x, (value) => {
    const inset = Math.max(width / 2 + value, 0);
    return `inset(0 ${inset}px 0 0)`;
  });

  return (
    <section className="relative w-full h-[80vh] flex items-center justify-center bg-black overflow-hidden">
      <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-2xl">
        {/* Base (unfiltered) image */}
        <img src={imageUrl} alt="Sans lunettes" className="absolute inset-0 w-full h-full object-cover select-none" />

        {/* Polarized side */}
        <motion.div style={{ clipPath: clip }} className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={imageUrl}
            alt="Avec filtre polarisé"
            className="w-full h-full object-cover select-none"
            style={{
              filter: "contrast(1.08) saturate(1.06) brightness(0.96)",
            }}
          />

          {/* Subtle polarization effect: reduces glare */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-white/5 mix-blend-multiply" />

          {/* Slight blue enhancement (very subtle) */}
          <div className="absolute inset-0 bg-[rgba(0,30,60,0.1)] mix-blend-overlay" />
        </motion.div>

        {/* Draggable Divider */}
        <motion.div
          drag="x"
          dragConstraints={{ left: -width / 2, right: 0 }}
          style={{ x }}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          className="absolute top-0 bottom-0 w-[2px] bg-white z-20 cursor-ew-resize flex items-center justify-center"
        >
          <motion.div
            animate={{ scale: isDragging ? 1.15 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-6 h-6 rounded-full bg-white shadow-lg border border-gray-300"
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
