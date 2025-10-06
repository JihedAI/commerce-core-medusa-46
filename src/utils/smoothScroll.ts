// Smooth scrolling utilities
export function smoothScrollTo(element: HTMLElement | null, offset = 0) {
  if (!element) return;
  
  const elementPosition = element.offsetTop - offset;
  const startPosition = window.pageYOffset;
  const distance = elementPosition - startPosition;
  const duration = Math.min(Math.abs(distance) / 2, 800); // Max 800ms
  let start: number | null = null;

  function animation(currentTime: number) {
    if (start === null) start = currentTime;
    const timeElapsed = currentTime - start;
    const progress = Math.min(timeElapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    window.scrollTo(0, startPosition + distance * easeOut);
    
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

export function scrollToProductsGrid() {
  const productsGrid = document.querySelector('[data-products-grid]');
  if (productsGrid) {
    smoothScrollTo(productsGrid as HTMLElement, 100);
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
