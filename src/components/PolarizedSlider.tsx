import React, { useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface PolarizedSliderProps {
  imageUrl: string;
}

export default function PolarizedSlider({ imageUrl }: PolarizedSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const clipPath = useTransform(
    x,
    (value) => `inset(0 ${Math.max(0, 100 - (value / (containerRef.current?.offsetWidth || 1)) * 100)}% 0 0)`
  );

  return (
    <section className="relative w-screen h-[80vh] -mx-[50vw] left-1/2 right-1/2 flex items-center justify-center bg-background overflow-hidden">
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
      >
        {/* Polarized Filtered Image (Right Side) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={imageUrl}
            alt="Polarized view"
            className="w-full h-full object-cover select-none"
            style={{
              filter: "contrast(1.3) saturate(1.4) brightness(0.95) hue-rotate(5deg)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 mix-blend-overlay" />
        </div>

        {/* Normal Image (Left Side - Clipped) */}
        <motion.div
          style={{ clipPath }}
          className="absolute inset-0 overflow-hidden"
        >
          <img
            src={imageUrl}
            alt="Normal view"
            className="w-full h-full object-cover select-none"
            style={{
              filter: "sepia(0.15) brightness(1.05)",
            }}
          />
        </motion.div>

        {/* Draggable Divider */}
        <motion.div
          drag="x"
          dragConstraints={containerRef}
          style={{ x }}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-gradient-to-b from-white/60 via-white/90 to-white/60 cursor-ew-resize z-20 shadow-[0_0_20px_rgba(255,255,255,0.5)]"
        >
          {/* Slider Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div
              className={`w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 flex items-center justify-center transition-all duration-200 ${
                isDragging ? "scale-110 shadow-[0_12px_40px_rgba(0,0,0,0.2)]" : "scale-100"
              }`}
            >
              <div className="flex gap-1">
                <div className="w-0.5 h-4 bg-foreground/40 rounded-full" />
                <div className="w-0.5 h-4 bg-foreground/40 rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating Labels */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="absolute left-8 top-8 md:left-12 md:top-12"
        >
          <div className="backdrop-blur-md bg-background/40 border border-white/10 text-foreground text-xs md:text-sm px-4 py-2 rounded-full shadow-lg font-light tracking-wide">
            Sans polarisation
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="absolute right-8 top-8 md:right-12 md:top-12"
        >
          <div className="backdrop-blur-md bg-background/40 border border-white/10 text-foreground text-xs md:text-sm px-4 py-2 rounded-full shadow-lg font-light tracking-wide">
            Avec polarisation
          </div>
        </motion.div>

        {/* Center Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center"
        >
          <p className="text-white text-sm md:text-base font-light tracking-[0.2em] uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            Glissez pour découvrir
          </p>
        </motion.div>
      </div>
    </section>
  );
}
