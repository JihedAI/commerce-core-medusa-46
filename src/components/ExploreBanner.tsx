import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { scrollToCollections } from "@/utils/smoothScroll";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
export default function ExploreBanner() {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Image collection for the slider
  const images = [
    {
      src: "https://images.pexels.com/photos/7335264/pexels-photo-7335264.jpeg",
      alt: "Premium eyewear collection",
    },
    {
      src: "https://images.pexels.com/photos/34091940/pexels-photo-34091940.jpeg",
      alt: "Elegant glasses showcase",
    },
    {
      src: "https://images.pexels.com/photos/7507071/pexels-photo-7507071.jpeg",
      alt: "Modern eyewear design",
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 3000); // Change image every 5 seconds
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, images.length]);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Handle smooth scroll to collections section
  const handleCollectionsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToCollections();
  };
  return (
    <section
      className="relative w-full h-[70vh] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Slider */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{
              opacity: 0,
              scale: 1.1,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
            }}
            transition={{
              duration: 1.2,
              ease: "easeInOut",
            }}
            className="absolute inset-0"
          >
            <img
              src={images[currentImageIndex].src}
              alt={images[currentImageIndex].alt}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent"></div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-all duration-300 opacity-0 group-hover:opacity-100"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-all duration-300 opacity-0 group-hover:opacity-100"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImageIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center group">
        <div className="container mx-auto px-8 lg:px-16">
          <div className="max-w-2xl space-y-8">
            {/* Main heading */}
            <div className="space-y-4">
              <div className="inline-block">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary bg-primary/10 px-4 py-2 rounded-full">
                  {t("explore.newCollection", {
                    defaultValue: "New Collection",
                  })}
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-display font-bold text-foreground leading-tight">
                {t("explore.title1", {
                  defaultValue: "Explore",
                })}
                <span className="block text-primary">
                  {t("explore.title2", {
                    defaultValue: "The Future",
                  })}
                </span>
                <span className="block">
                  {t("explore.title3", {
                    defaultValue: "Of Vision",
                  })}
                </span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-xl text-foreground/80 leading-relaxed max-w-lg">
              {t("explore.description", {
                defaultValue:
                  "Discover our cutting-edge eyewear collection where innovation meets style. Experience unparalleled comfort and crystal-clear vision with our latest designs.",
              })}
            </p>

            {/* Call to action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/products"
                className="group bg-primary text-primary-foreground px-8 py-4 font-semibold tracking-wide hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 text-center"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>
                    {t("hero.shopNow", {
                      defaultValue: "Shop Now",
                    })}
                  </span>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>

              <a
                href="#collections-section"
                onClick={handleCollectionsClick}
                className="group border-2 border-foreground text-foreground px-8 py-4 font-semibold tracking-wide hover:bg-foreground hover:text-background transition-all duration-300 text-center cursor-pointer"
                aria-label="Scroll to collections section"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>
                    {t("explore.viewCollections", {
                      defaultValue: "View Collections",
                    })}
                  </span>
                  <svg
                    className="w-5 h-5 transform group-hover:rotate-45 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </span>
              </a>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-6 pt-8 text-sm">
              <div className="flex items-center space-x-2 text-foreground/70">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>
                  {t("explore.freeShipping", {
                    defaultValue: "Free Shipping",
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-foreground/70">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>
                  {t("explore.returns", {
                    defaultValue: "30-Day Returns",
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-foreground/70">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>
                  {t("explore.warranty", {
                    defaultValue: "Lifetime Warranty",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center space-y-2 text-foreground/50">
            <div className="w-px h-8 bg-foreground/30 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
