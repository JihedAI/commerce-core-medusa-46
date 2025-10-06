import { useEffect, useRef } from 'react';

interface PreloadOptions {
  priority?: boolean;
  quality?: number;
  width?: number;
}

// Global image cache
const imageCache = new Map<string, boolean>();
const preloadQueue = new Set<string>();

export function useImagePreloader() {
  const preloadRef = useRef<Set<string>>(new Set());

  const preloadImage = async (src: string, options: PreloadOptions = {}): Promise<boolean> => {
    const { priority = false, quality = 80, width = 400 } = options;
    
    if (!src || src.startsWith('data:') || src.startsWith('/placeholder')) {
      return true;
    }

    // Check cache first
    if (imageCache.has(src)) {
      return true;
    }

    // Avoid duplicate preloads
    if (preloadQueue.has(src)) {
      return new Promise((resolve) => {
        const checkCache = () => {
          if (imageCache.has(src)) {
            resolve(true);
          } else {
            setTimeout(checkCache, 50);
          }
        };
        checkCache();
      });
    }

    preloadQueue.add(src);

    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        imageCache.set(src, true);
        preloadQueue.delete(src);
        resolve(true);
      };
      
      img.onerror = () => {
        preloadQueue.delete(src);
        resolve(false);
      };

      // Optimize image URL
      const optimizedSrc = optimizeImageUrl(src, width, quality);
      img.src = optimizedSrc;
    });
  };

  const preloadImages = async (urls: string[], options: PreloadOptions = {}) => {
    const { priority = false } = options;
    
    if (priority) {
      // Load all images immediately
      await Promise.allSettled(urls.map(url => preloadImage(url, options)));
    } else {
      // Load images in batches to avoid overwhelming the browser
      const batchSize = 3;
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        await Promise.allSettled(batch.map(url => preloadImage(url, options)));
        
        // Small delay between batches
        if (i + batchSize < urls.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
  };

  const clearCache = () => {
    imageCache.clear();
    preloadQueue.clear();
    preloadRef.current.clear();
  };

  return {
    preloadImage,
    preloadImages,
    clearCache,
    isCached: (src: string) => imageCache.has(src)
  };
}

// Optimize image URL for better performance
function optimizeImageUrl(src: string, width: number, quality: number): string {
  if (!src || src.startsWith('data:') || src.startsWith('/placeholder')) {
    return src;
  }

  try {
    const url = new URL(src);
    
    // Add optimization parameters
    url.searchParams.set('w', width.toString());
    url.searchParams.set('q', quality.toString());
    url.searchParams.set('f', 'webp');
    url.searchParams.set('fit', 'cover');
    
    return url.toString();
  } catch {
    return src;
  }
}

export default useImagePreloader;
