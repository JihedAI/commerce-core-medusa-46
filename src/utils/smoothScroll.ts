// Smooth scrolling utilities
export function smoothScrollTo(element: HTMLElement | null, offset = 0) {
  if (!element) return;
  
  const elementPosition = element.offsetTop - offset;
  const startPosition = window.pageYOffset;
  const distance = elementPosition - startPosition;
  const duration = Math.min(Math.abs(distance) / 2, 1000); // Max 1000ms for smoother feel
  let start: number | null = null;

  function animation(currentTime: number) {
    if (start === null) start = currentTime;
    const timeElapsed = currentTime - start;
    const progress = Math.min(timeElapsed / duration, 1);
    
    // Enhanced easing function (ease-in-out) for more natural feel
    const easeInOut = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    window.scrollTo(0, startPosition + distance * easeInOut);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

export function scrollToTop(smooth = true) {
  if (smooth) {
    smoothScrollTo(document.body, 0);
  } else {
    window.scrollTo(0, 0);
  }
}

export function scrollToElementById(elementId: string, offset = 80) {
  const element = document.getElementById(elementId);
  if (element) {
    smoothScrollTo(element, offset);
  }
}

export function scrollToCollections() {
  scrollToElementById('collections-section', 100);
}

export function scrollToProductsGrid() {
  const productsGrid = document.querySelector('[data-products-grid]');
  if (productsGrid) {
    smoothScrollTo(productsGrid as HTMLElement, 100);
  }
}

// Enhanced scroll to top with better mobile support
export function scrollToTopEnhanced() {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    window.scrollTo({ top: 0, behavior: 'auto' });
    return;
  }

  // Use native smooth scrolling if available, fallback to custom
  if ('scrollBehavior' in document.documentElement.style) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    scrollToTop(true);
  }
}

// Intersection Observer for loading states
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  });
}
