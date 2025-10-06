import React, { memo, useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  fit?: "contain" | "cover";
}

// Image preloading cache
const imageCache = new Map<string, boolean>();
const preloadQueue = new Set<string>();

// Preload images in the background
const preloadImage = (src: string): Promise<void> => {
  if (imageCache.has(src)) {
    return Promise.resolve();
  }

  if (preloadQueue.has(src)) {
    return new Promise((resolve) => {
      const checkCache = () => {
        if (imageCache.has(src)) {
          resolve();
        } else {
          setTimeout(checkCache, 50);
        }
      };
      checkCache();
    });
  }

  preloadQueue.add(src);
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, true);
      preloadQueue.delete(src);
      resolve();
    };
    img.onerror = () => {
      preloadQueue.delete(src);
      reject(new Error(`Failed to load image: ${src}`));
    };
    img.src = src;
  });
};

// Generate optimized image URL with compression
const getOptimizedImageUrl = (src: string, width = 400, quality = 80): string => {
  if (!src || src.startsWith('data:') || src.startsWith('/placeholder')) {
    return src;
  }

  // If it's a Medusa image, try to optimize it
  if (src.includes('medusa')) {
    // Add query parameters for optimization
    const url = new URL(src);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('q', quality.toString());
    url.searchParams.set('f', 'webp');
    return url.toString();
  }

  return src;
};

const OptimizedImage = memo(({ 
  src, 
  alt, 
  className, 
  fallback = "/placeholder.svg",
  priority = false,
  sizes = "(max-width: 768px) 50vw, 33vw",
  quality = 80,
  onLoad,
  onError,
  fit = "contain"
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Optimize image URL
  const optimizedSrc = getOptimizedImageUrl(src, 400, quality);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, isInView]);

  // Load image when in view
  useEffect(() => {
    if (!isInView) return;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        // Preload the image
        await preloadImage(optimizedSrc);
        setImageSrc(optimizedSrc);
      } catch (error) {
        console.warn('Failed to preload image:', error);
        setImageSrc(optimizedSrc);
      }
    };

    loadImage();
  }, [isInView, optimizedSrc]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    setImageSrc(fallback);
    onError?.();
  }, [fallback, onError]);

  return (
    <div className="relative overflow-hidden">
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      )}
      
      {/* Image */}
      <img
        ref={imgRef}
        src={imageSrc || (isInView ? optimizedSrc : '')}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full max-w-full max-h-full object-center transition-all duration-300",
          fit === "contain" ? "object-contain" : "object-cover",
          isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100",
          className
        )}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        sizes={sizes}
        style={{
          willChange: isLoading ? 'opacity, transform' : 'auto'
        }}
      />
    </div>
  );
});

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;