import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TextAnimationOptions {
  texts: string[];
  interval?: number;
  animationDuration?: number;
  animationType?: 'fade' | 'slide' | 'scale' | 'flip';
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
}

interface TextAnimationReturn {
  currentText: string;
  currentIndex: number;
  isAnimating: boolean;
  startAnimation: () => void;
  stopAnimation: () => void;
  MotionText: React.ComponentType<{ children: React.ReactNode; className?: string }>;
}

export function useTextAnimation({
  texts,
  interval = 3000,
  animationDuration = 0.5,
  animationType = 'slide',
  direction = 'up',
  delay = 0
}: TextAnimationOptions): TextAnimationReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentText = texts[currentIndex] || '';

  const startAnimation = useCallback(() => {
    if (intervalRef.current || texts.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, interval);
  }, [texts.length, interval]);

  const stopAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      startAnimation();
    }, delay);

    return () => {
      clearTimeout(timer);
      stopAnimation();
    };
  }, [startAnimation, stopAnimation, delay]);

  // Motion component for text animation
  const MotionText = useCallback(({ children, className }: { children: React.ReactNode; className?: string }) => {
    const getAnimationProps = () => {
      switch (animationType) {
        case 'fade':
          return {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: animationDuration, ease: 'easeInOut' }
          };
        case 'slide':
          return {
            initial: { 
              y: direction === 'up' ? '100%' : direction === 'down' ? '-100%' : 0,
              x: direction === 'left' ? '100%' : direction === 'right' ? '-100%' : 0,
              opacity: 0 
            },
            animate: { 
              y: '0%', 
              x: '0%', 
              opacity: 1 
            },
            exit: { 
              y: direction === 'up' ? '-100%' : direction === 'down' ? '100%' : 0,
              x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
              opacity: 0 
            },
            transition: { duration: animationDuration, ease: 'easeInOut' }
          };
        case 'scale':
          return {
            initial: { scale: 0.8, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 1.2, opacity: 0 },
            transition: { duration: animationDuration, ease: 'easeInOut' }
          };
        case 'flip':
          return {
            initial: { rotateX: 90, opacity: 0 },
            animate: { rotateX: 0, opacity: 1 },
            exit: { rotateX: -90, opacity: 0 },
            transition: { duration: animationDuration, ease: 'easeInOut' }
          };
        default:
          return {
            initial: { y: '100%', opacity: 0 },
            animate: { y: '0%', opacity: 1 },
            exit: { y: '-100%', opacity: 0 },
            transition: { duration: animationDuration, ease: 'easeInOut' }
          };
      }
    };

    return (
      <div className={`relative overflow-hidden ${className || ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            {...getAnimationProps()}
            className="block"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }, [currentIndex, animationType, direction, animationDuration]);

  return {
    currentText,
    currentIndex,
    isAnimating,
    startAnimation,
    stopAnimation,
    MotionText
  };
}
