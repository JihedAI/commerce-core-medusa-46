import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { gsap } from "gsap";

interface VideoHeroProps {
  videos: string[];
}

export default function VideoHero({ videos }: VideoHeroProps) {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-play functionality
    const playVideo = (index: number) => {
      const video = videoRefs.current[index];
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {
          // Handle autoplay restrictions
        });
      }
    };

    // Start progress tracking
    intervalRef.current = setInterval(() => {
      const video = videoRefs.current[currentVideo];
      if (video && video.duration) {
        const newProgress = (video.currentTime / video.duration) * 100;
        setProgress(newProgress);

        // Auto-advance to next video when current one ends
        if (video.currentTime >= video.duration - 0.1) {
          const nextVideo = (currentVideo + 1) % videos.length;
          setCurrentVideo(nextVideo);
          setProgress(0);
        }
      }
    }, 100);

    playVideo(currentVideo);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentVideo, videos.length]);

  // Animate content on mount
  useEffect(() => {
    if (contentRef.current) {
      const elements = contentRef.current.querySelectorAll('.hero-animate');
      
      gsap.set(elements, { opacity: 0, y: 30 });
      
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        stagger: 0.2,
        delay: 0.5
      });
    }
  }, []);

  const handleVideoClick = (index: number) => {
    if (index !== currentVideo) {
      setCurrentVideo(index);
      setProgress(0);
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Fullscreen Video Background */}
      <div className="absolute inset-0">
        {videos.map((videoSrc, index) => (
          <video
            key={index}
            ref={(el) => (videoRefs.current[index] = el)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-2000 ${
              index === currentVideo ? 'opacity-100' : 'opacity-0'
            }`}
            muted
            loop={false}
            playsInline
            preload="metadata"
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ))}
        
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
      </div>

      {/* Content Overlay */}
      <div ref={contentRef} className="relative h-full flex flex-col items-center justify-end px-6 pb-32">
        {/* Tagline */}
        <div className="mb-8 text-center">
          <h1 className="hero-animate font-display text-5xl md:text-7xl lg:text-8xl text-primary mb-4 tracking-wider">
            TIMELESS
          </h1>
          <p className="hero-animate font-elegant text-xl md:text-2xl text-primary/90 tracking-[0.3em] uppercase">
            Redefine Your Perspective
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="hero-animate flex flex-col sm:flex-row gap-4 mb-16">
          <Link to="/products">
            <Button 
              size="lg"
              className="group bg-primary/10 backdrop-blur-md border border-primary/20 text-primary hover:bg-primary hover:text-background transition-all duration-500 px-8 py-6 text-sm tracking-[0.2em] uppercase"
            >
              Shop Now
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <Link to="/collections">
            <Button 
              size="lg"
              variant="outline"
              className="group bg-transparent backdrop-blur-md border border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all duration-500 px-8 py-6 text-sm tracking-[0.2em] uppercase"
            >
              Collections
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Progress Tracker - Positioned at bottom */}
        <div className="hero-animate absolute bottom-10 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => handleVideoClick(index)}
              className="relative group cursor-pointer"
              aria-label={`Go to video ${index + 1}`}
            >
              {/* Progress Line Background */}
              <div className="w-16 h-[2px] bg-primary/30 rounded-full overflow-hidden transition-all duration-300 group-hover:bg-primary/50">
                {/* Progress Fill */}
                <div
                  className={`h-full bg-primary rounded-full transition-all duration-300 ${
                    index === currentVideo
                      ? 'opacity-100'
                      : index < currentVideo
                      ? 'w-full opacity-100'
                      : 'w-0 opacity-50'
                  }`}
                  style={{
                    width: index === currentVideo ? `${progress}%` : index < currentVideo ? '100%' : '0%'
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}