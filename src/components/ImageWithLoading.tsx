import React, { memo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ImageWithLoadingProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const ImageWithLoading = memo(({ 
  src, 
  alt, 
  className, 
  fallback = "/placeholder.svg",
  onLoad,
  onError 
}: ImageWithLoadingProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

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
      {isLoading && (
        <div className="absolute inset-0 bg-muted/50 animate-pulse flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}
      
      <img
        src={hasError ? fallback : imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
});

ImageWithLoading.displayName = "ImageWithLoading";

export default ImageWithLoading;
