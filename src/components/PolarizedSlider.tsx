import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface PolarizedSliderProps {
  imageUrl: string;
}

export default function PolarizedSlider({ imageUrl }: PolarizedSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  // 🧮 Initial position setup (e.g., 70% of width)
  useEffect(() => {
    const containerWidth = containerRef.current?.offsetWidth || 0;
    if (containerWidth) {
      x.set(containerWidth * 0.5); // <-- change 0.7 to 0.6 / 0.8 as you like
    }
  }, []);

  const clipPath = useTransform(
    x,
    (value) => `inset(0 ${Math.max(0, 100 - (value / (containerRef.current?.offsetWidth || 1)) * 100)}% 0 0)`,
  );

  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black/5">
      <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-2xl">
        {/* 🔹 Right Side (Polarized) */}
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt="Polarized"
            className="w-full h-full object-cover select-none"
            style={{
              filter: "contrast(1.5) saturate(1.5) brightness(0.9) hue-rotate(15deg)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-blue-500/10 mix-blend-overlay" />
        </div>

        {/* 🔸 Left Side (Normal) */}
        <motion.div style={{ clipPath }} className="absolute inset-0 overflow-hidden">
          <img
            src={imageUrl}
            alt="Normal"
            className="w-full h-full object-cover select-none"
            style={{
              filter: "brightness(1.05) saturate(0.9)",
            }}
          />
        </motion.div>

        {/* ⚪ Divider */}
        <motion.div
          drag="x"
          dragConstraints={containerRef}
          style={{ x }}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          className="absolute top-0 bottom-0 w-[1.5px] bg-white/70 cursor-ew-resize z-20"
        >
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className={`w-8 h-8 rounded-full bg-white/90 border border-white/20 backdrop-blur-sm shadow-md flex items-center justify-center transition-transform ${
                isDragging ? "scale-110" : "scale-100"
              }`}
            >
              <div className="flex gap-[2px]">
                <div className="w-0.5 h-3 bg-black/40 rounded-full" />
                <div className="w-0.5 h-3 bg-black/40 rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Labels */}
        <div className="absolute left-4 top-4 md:left-8 md:top-8">
          <div className="bg-white/70 text-black text-[10px] md:text-xs px-3 py-1 rounded-full font-medium shadow-sm backdrop-blur-sm">
            Sans polarisation
          </div>
        </div>
        <div className="absolute right-4 top-4 md:right-8 md:top-8">
          <div className="bg-white/70 text-black text-[10px] md:text-xs px-3 py-1 rounded-full font-medium shadow-sm backdrop-blur-sm">
            Avec polarisation
          </div>
        </div>

        {/* Hint Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center"
        ></motion.div>
      </div>
    </section>
  );
}
