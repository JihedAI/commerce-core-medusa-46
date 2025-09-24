import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useGSAPAnimations = (dependencies: any[] = []) => {
  useEffect(() => {
    // Debounce scroll events for better performance
    let scrollTimeout: NodeJS.Timeout;
    const debouncedScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        ScrollTrigger.update();
      }, 100);
    };

    window.addEventListener('scroll', debouncedScroll, { passive: true });

    // Cleanup function to kill all ScrollTriggers on unmount
    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', debouncedScroll);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, dependencies);

  const animateOnScroll = (
    trigger: HTMLElement,
    elements: string | HTMLElement | HTMLElement[],
    options: {
      from?: gsap.TweenVars;
      to?: gsap.TweenVars;
      start?: string;
      stagger?: number;
      once?: boolean;
    } = {}
  ) => {
    const {
      from = { opacity: 0, y: 30 },
      to = { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      start = "top 80%",
      stagger = 0.1,
      once = true
    } = options;

    if (stagger && Array.isArray(elements)) {
      gsap.fromTo(elements, from, {
        ...to,
        stagger,
        scrollTrigger: {
          trigger,
          start,
          once
        }
      });
    } else {
      gsap.fromTo(elements, from, {
        ...to,
        scrollTrigger: {
          trigger,
          start,
          once
        }
      });
    }
  };

  const animateCounter = (
    element: HTMLElement,
    finalValue: number,
    options: {
      duration?: number;
      delay?: number;
      trigger?: HTMLElement;
    } = {}
  ) => {
    const { duration = 2, delay = 0, trigger = element } = options;

    gsap.fromTo(element,
      { textContent: 0 },
      {
        textContent: finalValue,
        duration,
        delay,
        ease: "power2.out",
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger,
          start: "top 80%",
          once: true
        }
      }
    );
  };

  return { animateOnScroll, animateCounter };
};