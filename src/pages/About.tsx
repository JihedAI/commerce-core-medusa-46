import React, { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Layout from "@/components/Layout";
import Head from "@/components/Head";
import OptimizedImage from "@/components/OptimizedImage";
import VideoHero from "@/components/VideoHero";
import Typewriter from "@/components/Typewriter";
import logo from "@/assets/logo.svg";
gsap.registerPlugin(ScrollTrigger);
export default function About() {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Hero animation
  useEffect(() => {
    if (heroRef.current) {
      const logo = heroRef.current.querySelector(".logo");
      const subtitle = heroRef.current.querySelector(".subtitle");
      gsap.set([logo, subtitle], {
        opacity: 0,
        y: 30,
      });
      gsap.to([logo, subtitle], {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power2.out",
        stagger: 0.3,
        delay: 0.5,
      });
    }
  }, []);

  // Story section animation
  useEffect(() => {
    if (storyRef.current) {
      const elements = storyRef.current.querySelectorAll(".story-element");
      gsap.set(elements, {
        opacity: 0,
        y: 40,
      });
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.2,
        scrollTrigger: {
          trigger: storyRef.current,
          start: "top 80%",
          once: true,
        },
      });
    }
  }, []);

  // Image animation
  useEffect(() => {
    if (imageRef.current) {
      gsap.fromTo(
        imageRef.current,
        {
          scale: 1.1,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 85%",
            once: true,
          },
        },
      );
    }
  }, []);
  return (
    <>
      <Head title="About — Amine Eyewear" description="Founded to redefine eyewear with premium quality and design." url="https://lunette.amine.agency/about" />
      <Layout>
      {/* Full-bleed video section first */}
      <VideoHero
        videos={["https://web-video-resource.gentlemonster.com/assets/video/ps/PS_main_landing_PC_1920x1080.mp4"]}
        showContent={false}
        loop
      />

      {/* Logo Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30"
      >
        <div className="text-center space-y-8 px-6">
          {/* Logo */}
          <div className="logo">
            <img 
              src={logo} 
              alt="Amine Eyewear" 
              className="h-16 md:h-24 lg:h-32 mx-auto"
            />
          </div>

          {/* Subtitle */}
          <div className="subtitle">
            <p className="font-elegant text-xl md:text-2xl text-muted-foreground tracking-[0.3em] uppercase">
              {t("about.heroSubtitle", {
                defaultValue: "Redefining Vision Since 1999",
              })}
            </p>
          </div>

          {/* keep original spacing only */}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2"></div>
      </section>

      {/* Story Section */}
      <section ref={storyRef} className="py-20 px-6 lg:px-16">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-20 story-element">
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
              {t("story.title", {
                defaultValue: "Our Story",
              })}
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </div>

          {/* Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div ref={textRef} className="space-y-8 story-element">
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  <Typewriter
                    text={t("story.paragraph1", {
                      defaultValue:
                        "Founded with a vision to revolutionize eyewear, we've been crafting exceptional glasses that blend style, comfort, and innovation for over two decades.",
                    })}
                  />
                </p>
                <p>
                  <Typewriter
                    startDelayMs={400}
                    text={t("story.paragraph2", {
                      defaultValue:
                        "From our humble beginnings as a small optical shop to becoming a trusted name in premium eyewear, our journey has been driven by one simple belief: everyone deserves to see the world clearly and look great doing it.",
                    })}
                  />
                </p>
                <p>
                  <Typewriter
                    startDelayMs={800}
                    text={t("story.paragraph3", {
                      defaultValue:
                        "Today, we continue to push boundaries with cutting-edge lens technology, sustainable materials, and timeless designs that enhance your natural beauty while protecting your vision.",
                    })}
                  />
                </p>
              </div>

              {/* Values */}
              <div className="space-y-6 pt-8">
                <h3 className="text-2xl font-semibold text-foreground">
                  {t("about.ourValues", {
                    defaultValue: "Our Values",
                  })}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {t("about.quality", {
                          defaultValue: "Uncompromising Quality",
                        })}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {t("about.qualityDesc", {
                          defaultValue: "Every frame is crafted with precision and attention to detail.",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {t("about.innovation", {
                          defaultValue: "Continuous Innovation",
                        })}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {t("about.innovationDesc", {
                          defaultValue: "Pioneering new technologies and sustainable materials.",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {t("about.customer", {
                          defaultValue: "Customer-Centric",
                        })}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {t("about.customerDesc", {
                          defaultValue: "Your vision and comfort are our top priorities.",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image */}
            <div ref={imageRef} className="story-element">
              <div className="relative overflow-hidden rounded-2xl aspect-[4/5]">
                <OptimizedImage
                  src="https://images.pexels.com/photos/7335264/pexels-photo-7335264.jpeg"
                  alt="Amine eyewear craftsmanship"
                  className="w-full h-full object-cover"
                  quality={90}
                  priority={true}
                  fit="cover"
                />
                {/* Overlay gradient */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center story-element">
                <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                  <span className="stat-number">25</span>+
                </div>
                <div className="text-sm uppercase tracking-wide text-muted-foreground">
                  {t("story.yearsExperience", {
                    defaultValue: "Years Experience",
                  })}
                </div>
              </div>

              <div className="text-center story-element">
                <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                  <span className="stat-number">50000</span>+
                </div>
                <div className="text-sm uppercase tracking-wide text-muted-foreground">
                  {t("story.happyCustomers", {
                    defaultValue: "Happy Customers",
                  })}
                </div>
              </div>

              <div className="text-center story-element">
                <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                  <span className="stat-number">1000</span>+
                </div>
                <div className="text-sm uppercase tracking-wide text-muted-foreground">
                  {t("story.frameStyles", {
                    defaultValue: "Frame Styles",
                  })}
                </div>
              </div>

              <div className="text-center story-element">
                <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                  <span className="stat-number">15</span>
                </div>
                <div className="text-sm uppercase tracking-wide text-muted-foreground">
                  {t("story.storeLocations", {
                    defaultValue: "Store Locations",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 lg:px-16">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="story-element space-y-8">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
              {t("about.mission", {
                defaultValue: "Our Mission",
              })}
            </h2>

            <div className="w-24 h-1 bg-primary mx-auto"></div>

            <p className="text-xl text-muted-foreground leading-relaxed">
              <Typewriter
                text={t("about.missionText", {
                  defaultValue:
                    "To empower every individual to see the world with clarity, confidence, and style. We believe that exceptional eyewear is not just a necessity—it's a statement of who you are and who you aspire to be.",
                })}
              />
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="container mx-auto px-6 lg:px-16 text-center">
          <div className="max-w-3xl mx-auto story-element space-y-8">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
              {t("about.ctaTitle", {
                defaultValue: "Experience the Amine Difference",
              })}
            </h2>

            <p className="text-lg text-muted-foreground">
              <Typewriter
                text={t("about.ctaText", {
                  defaultValue:
                    "Discover our carefully curated collection of premium eyewear and find the perfect frames that reflect your unique style.",
                })}
                startDelayMs={300}
              />
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <a
                href="/#collections-section"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/#collections-section";
                }}
                className="group bg-primary text-primary-foreground px-8 py-4 font-semibold tracking-wide hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>
                    {t("nav.collections", {
                      defaultValue: "View Collections",
                    })}
                  </span>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </a>

              <a
                href="/products"
                className="group border-2 border-primary text-primary px-8 py-4 font-semibold tracking-wide hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>
                    {t("nav.products", {
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
              </a>
            </div>
          </div>
        </div>
      </section>
      </Layout>
    </>
  );
}
