import React, { useEffect, useRef, useState } from "react";

interface TypewriterProps {
  text: string;
  speedMs?: number; // time per character
  startDelayMs?: number; // delay before starting
  className?: string;
}

// Lightweight, reusable typewriter effect for short/medium texts
export default function Typewriter({
  text,
  speedMs = 18,
  startDelayMs = 150,
  className,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState<string>("");
  const indexRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset when text changes
    setDisplayed("");
    indexRef.current = 0;

    // Start after optional delay
    timeoutRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        indexRef.current += 1;
        setDisplayed(text.slice(0, indexRef.current));
        if (indexRef.current >= text.length && intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, Math.max(8, speedMs));
    }, Math.max(0, startDelayMs));

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [text, speedMs, startDelayMs]);

  return (
    <span className={className} aria-label={text}>
      {displayed}
      <span className="inline-block w-[0.6ch] align-baseline animate-pulse">|</span>
    </span>
  );
}


