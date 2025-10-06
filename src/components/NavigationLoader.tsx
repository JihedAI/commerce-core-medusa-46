import React from "react";
import { useLocation } from "react-router-dom";
import { useIsFetching } from "@tanstack/react-query";

export const NavigationLoader: React.FC = () => {
  const location = useLocation();
  const isFetching = useIsFetching();
  const [visible, setVisible] = React.useState(false);

  const minDurationMs = 350; // keep overlay at least this long
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const hideTimer = React.useRef<number | null>(null);

  // Start on route change
  React.useEffect(() => {
    setStartedAt(Date.now());
    setVisible(true);
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // Stop when no active queries and min duration elapsed
  React.useEffect(() => {
    if (!visible) return;
    if (isFetching > 0) return;

    const elapsed = startedAt ? Date.now() - startedAt : minDurationMs;
    const remaining = Math.max(0, minDurationMs - elapsed);
    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
      hideTimer.current = null;
    }, remaining);
  }, [isFetching, visible, startedAt]);

  React.useEffect(() => () => {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <EyesLoader />
      </div>
    </div>
  );
};

export default NavigationLoader;

const EyesLoader: React.FC = () => {
  const [t, setT] = React.useState(0);

  React.useEffect(() => {
    const motionTimer = window.setInterval(() => setT((v) => (v + 1) % 6000), 50);
    return () => window.clearInterval(motionTimer);
  }, []);

  // Figure-eight style gaze for clear visibility
  const gazeX = Math.sin(t / 25) * 6; // left-right
  const gazeY = Math.sin(t / 17) * 4; // up-down

  return (
    <div className="flex items-center justify-center gap-10">
      <Eye offsetX={gazeX} offsetY={gazeY} />
      <Eye offsetX={gazeX} offsetY={gazeY} mirrored />
    </div>
  );
};

const Eye: React.FC<{ mirrored?: boolean; offsetX?: number; offsetY?: number }> = ({ mirrored, offsetX = 0, offsetY = 0 }) => {
  const [blink, setBlink] = React.useState(false);
  const [t, setT] = React.useState(0);

  React.useEffect(() => {
    const blinkTimer = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 120);
    }, 2600 + Math.random() * 1200);

    const motionTimer = window.setInterval(() => setT((v) => (v + 1) % 1000), 60);

    return () => {
      window.clearInterval(blinkTimer);
      window.clearInterval(motionTimer);
    };
  }, []);

  const size = 64; // bigger for visibility
  const pupilRadius = 7;
  const swayX = Math.sin(t / 60) * 1.2; // idle micro-sway
  const swayY = Math.cos(t / 70) * 1.0;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={`transition-all duration-200 ease-out ${blink ? 'opacity-70' : 'opacity-100'}`}
      style={{ transform: mirrored ? 'scaleX(-1)' : undefined }}
    >
      {/* Eye outline */}
      <ellipse
        cx="20"
        cy="20"
        rx="18"
        ry={blink ? 2 : 12}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.2}
      />

      {/* Pupil */}
      {!blink && (
        <circle
          cx={20 + offsetX + swayX}
          cy={20 + offsetY + swayY}
          r={pupilRadius}
          fill="currentColor"
        />
      )}

      {/* Soft inner ring */}
      {!blink && (
        <circle
          cx={20 + offsetX + swayX}
          cy={20 + offsetY + swayY}
          r={pupilRadius + 3}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.4}
          opacity={0.4}
        />
      )}
    </svg>
  );
};


