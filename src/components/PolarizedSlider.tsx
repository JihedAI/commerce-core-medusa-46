import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface PolarizedSliderProps {
  imageUrl: string;
}

export default function PolarizedSlider({ imageUrl }: PolarizedSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  // ✅ Initial position (50% of container width)
  useEffect(() => {
    const updateInitial = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      if (containerWidth) x.set(containerWidth * 0.5);
    };
    updateInitial();
    window.addEventListener("resize", updateInitial);
    return () => window.removeEventListener("resize", updateInitial);
  }, [x]);

  // 🎨 Dynamic clip path (updates as user drags)
  const clipPath = useTransform(x, (value) => {
    const containerWidth = containerRef.current?.offsetWidth || 1;
    const percentage = Math.max(0, 100 - (value / containerWidth) * 100);
    return `inset(0 ${percentage}% 0 0)`;
  });

  return (
    <section
      className={`relative w-full flex items-center justify-center bg-black/5 ${isDragging ? "select-none" : ""}`}
    >
      {/* ✅ Responsive height fixes overflow on mobile */}
      <div
        ref={containerRef}
        className="relative w-full h-[55vh] sm:h-[65vh] md:h-[70vh] lg:h-[80vh] overflow-hidden rounded-none"
      >
        {/* Right (Polarized) */}
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

        {/* Left (Normal) */}
        <motion.div style={{ clipPath }} className="absolute inset-0 pointer-events-none">
          <img
            src={imageUrl}
            alt="Normal"
            className="w-full h-full object-cover select-none"
            style={{
              filter: "brightness(1.05) saturate(0.9)",
            }}
          />
        </motion.div>

        {/* Divider */}
        <motion.div
          drag="x"
          dragConstraints={containerRef}
          dragElastic={0}
          dragMomentum={false}
          onPointerDown={(e) => e.preventDefault()}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          style={{ x, touchAction: "none" }}
          className="absolute top-0 bottom-0 w-[2px] bg-white/70 cursor-ew-resize z-20"
        >
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
        <div className="absolute left-3 top-3 sm:left-6 sm:top-6">
          <div className="bg-white/70 text-black text-[10px] sm:text-xs px-3 py-1 rounded-full font-medium shadow-sm backdrop-blur-sm">
            Sans polarisation
          </div>
        </div>
        <div className="absolute right-3 top-3 sm:right-6 sm:top-6">
          <div className="bg-white/70 text-black text-[10px] sm:text-xs px-3 py-1 rounded-full font-medium shadow-sm backdrop-blur-sm">
            Avec polarisation
          </div>
        </div>
      </div>
    </section>
  );
}
