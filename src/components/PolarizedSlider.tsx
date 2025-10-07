import React, { useRef, useState, useLayoutEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

interface PolarizedSliderProps {
  imageUrl: string;
  sunglassesUrl?: string; // optional central overlay
}

export default function PolarizedSlider({ imageUrl, sunglassesUrl }: PolarizedSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 25 });

  useLayoutEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
      x.set(containerRef.current.offsetWidth / 2); // start centered
    }
  }, []);

  const clipPath = useTransform(springX, (val) => {
    const rightInset = Math.max(width - val, 0);
    return `inset(0 ${rightInset}px 0 0)`;
  });

  return (
    <section className="relative w-full h-[80vh] flex items-center justify-center bg-black overflow-hidden">
      <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-2xl">
        {/* Base (non-polarized) image */}
        <img src={imageUrl} alt="Normal view" className="absolute inset-0 w-full h-full object-cover select-none" />

        {/* Polarized image overlay */}
        <motion.div style={{ clipPath }} className="absolute inset-0 overflow-hidden">
          <img
            src={imageUrl}
            alt="Polarized view"
            className="w-full h-full object-cover select-none"
            style={{
              filter: "contrast(1.3) saturate(1.3) brightness(0.95) hue-rotate(190deg)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#004d7a]/30 to-[#00bf8f]/10 mix-blend-overlay" />
        </motion.div>

        {/* Draggable divider */}
        <motion.div
          drag="x"
          dragConstraints={containerRef}
          style={{ x: springX }}
          dragElastic={0}
          dragMomentum={false}
          className="absolute top-0 bottom-0 w-[2px] bg-white/80 cursor-ew-resize z-20 flex items-center justify-center"
        >
          <div className="w-6 h-6 rounded-full bg-white shadow-lg border border-gray-300" />
        </motion.div>

        {/* Optional sunglasses overlay */}
        {sunglassesUrl && (
          <img
            src={sunglassesUrl}
            alt="Sunglasses"
            className="absolute top-1/2 left-1/2 w-40 md:w-52 -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl z-30"
          />
        )}

        {/* Labels */}
        <div className="absolute left-6 top-6 bg-white/70 text-black text-xs md:text-sm px-3 py-1 rounded-full shadow">
          Sans lunettes
        </div>
        <div className="absolute right-6 top-6 bg-white/70 text-black text-xs md:text-sm px-3 py-1 rounded-full shadow">
          Avec filtre polarisé
        </div>
      </div>
    </section>
  );
}
