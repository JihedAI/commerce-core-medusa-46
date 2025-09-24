import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = '/placeholder.svg';
      }}
    />
  );
}