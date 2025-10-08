import React, { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTextAnimation } from "@/hooks/useTextAnimation";
import Typewriter from "./Typewriter";

gsap.registerPlugin(ScrollTrigger);

export default function StorySection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Animated story titles
  const storyTitles = [
    t('story.title', { defaultValue: 'Our Story' }),
    t('story.titleAlt1', { defaultValue: 'Our Journey' }),
    t('story.titleAlt2', { defaultValue: 'Our Heritage' }),
    t('story.titleAlt3', { defaultValue: 'Our Vision' })
  ];

  const { currentText: currentStoryTitle, MotionText: MotionStoryTitle } = useTextAnimation({
    texts: storyTitles,
    interval: 6000,
    animationDuration: 0.5,
    animationType: 'slide',
    direction: 'up',
    delay: 2000
  });

  useEffect(() => {
    if (sectionRef.current && contentRef.current && statsRef.current) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          once: true
        }
      });

      // Animate content blocks
      const contentBlocks = contentRef.current.children;
      tl.fromTo(contentBlocks, 
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: "power2.out",
          stagger: 0.2
        }
      );

      // Animate stats with counter effect
      const statNumbers = statsRef.current.querySelectorAll('.stat-number');
      statNumbers.forEach((stat, index) => {
        const finalValue = parseInt(stat.textContent || '0');
        gsap.fromTo(stat,
          { textContent: 0 },
          {
            textContent: finalValue,
            duration: 2,
            ease: "power2.out",
            delay: 0.5 + (index * 0.1),
            snap: { textContent: 1 },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              once: true
            }
          }
        );
      });

      // Animate stat items and achievement badges
      const animatedItems = statsRef.current.querySelectorAll('.stat-item, .achievement-item');
      tl.fromTo(animatedItems, 
        { opacity: 0, scale: 0.9 },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 0.6, 
          ease: "back.out(1.2)",
          stagger: 0.1
        },
        "-=0.5"
      );
    }
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-20 px-8 lg:px-16 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Story Content */}
          <div ref={contentRef} className="space-y-8">
            <div className="space-y-4 opacity-0">
              <MotionStoryTitle className="text-4xl lg:text-5xl font-display font-bold text-foreground min-h-[1.2em]">
                {currentStoryTitle}
              </MotionStoryTitle>
              <div className="w-16 h-1 bg-primary"></div>
            </div>
            
            <div className="opacity-0 space-y-6 text-lg text-foreground/80 leading-relaxed">
              <p>
                <Typewriter text={t('story.paragraph1', { defaultValue: 'Founded with a vision to revolutionize eyewear, we\'ve been crafting exceptional glasses that blend style, comfort, and innovation for over two decades.' })} />
              </p>
              <p>
                <Typewriter startDelayMs={400} text={t('story.paragraph2', { defaultValue: 'From our humble beginnings as a small optical shop to becoming a trusted name in premium eyewear, our journey has been driven by one simple belief: everyone deserves to see the world clearly and look great doing it.' })} />
              </p>
              <p>
                <Typewriter startDelayMs={800} text={t('story.paragraph3', { defaultValue: 'Today, we continue to push boundaries with cutting-edge lens technology, sustainable materials, and timeless designs that enhance your natural beauty while protecting your vision.' })} />
              </p>
            </div>
            
            <div className="opacity-0 pt-4">
              <a 
                href="/about"
                className="inline-block bg-primary text-primary-foreground px-8 py-4 font-semibold tracking-wide hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
              >
                {t('story.learnMore', { defaultValue: 'Learn More About Us' })}
              </a>
            </div>
          </div>
          
          {/* Story Stats */}
          <div ref={statsRef} className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="stat-item opacity-0 text-center space-y-2">
                <div className="text-4xl font-bold text-primary">
                  <span className="stat-number">25</span>+
                </div>
                <div className="text-sm uppercase tracking-wide text-foreground/70">{t('story.yearsExperience', { defaultValue: 'Years Experience' })}</div>
              </div>
              
              <div className="stat-item opacity-0 text-center space-y-2">
                <div className="text-4xl font-bold text-primary">
                  <span className="stat-number">50000</span>+
                </div>
                <div className="text-sm uppercase tracking-wide text-foreground/70">{t('story.happyCustomers', { defaultValue: 'Happy Customers' })}</div>
              </div>
              
              <div className="stat-item opacity-0 text-center space-y-2">
                <div className="text-4xl font-bold text-primary">
                  <span className="stat-number">1000</span>+
                </div>
                <div className="text-sm uppercase tracking-wide text-foreground/70">{t('story.frameStyles', { defaultValue: 'Frame Styles' })}</div>
              </div>
              
              <div className="stat-item opacity-0 text-center space-y-2">
                <div className="text-4xl font-bold text-primary">
                  <span className="stat-number">15</span>
                </div>
                <div className="text-sm uppercase tracking-wide text-foreground/70">{t('story.storeLocations', { defaultValue: 'Store Locations' })}</div>
              </div>
            </div>
            
            {/* Achievement badges */}
            <div className="space-y-4 pt-8">
              <div className="achievement-item opacity-0 flex items-center space-x-4 p-4 bg-background/50 rounded-lg">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">★</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{t('story.awardWinning', { defaultValue: 'Award Winning Design' })}</div>
                  <div className="text-sm text-foreground/70">{t('story.awardDescription', { defaultValue: 'International Eyewear Design Awards 2023' })}</div>
                </div>
              </div>
              
              <div className="achievement-item opacity-0 flex items-center space-x-4 p-4 bg-background/50 rounded-lg">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">♻</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{t('story.ecoFriendly', { defaultValue: 'Eco-Friendly' })}</div>
                  <div className="text-sm text-foreground/70">{t('story.ecoDescription', { defaultValue: 'Sustainable materials & packaging' })}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}