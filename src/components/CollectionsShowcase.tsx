import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useTranslation } from "react-i18next";
import useCollections from "@/hooks/useCollections";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CollectionType {
  id: string;
  title: string;
  handle: string;
  metadata: {
    imgUrl?: string;
    description?: string;
    [key: string]: any;
  } | null;
}

export default function CollectionsShowcase() {
  const { t } = useTranslation();
  const { data: collectionsData = [], isLoading: loading } = useCollections({ fields: "id,title,handle,metadata", limit: 100 });
  const collections = collectionsData as CollectionType[];
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);


  // GSAP animations
  useEffect(() => {
    if (!loading && collections.length && sectionRef.current && titleRef.current && gridRef.current) {
      const collectionCards = gridRef.current.querySelectorAll('.collection-card');
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true
        }
      });

      tl.fromTo(titleRef.current, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
      .fromTo(collectionCards, 
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          ease: "power2.out",
          stagger: 0.15
        },
        "-=0.4"
      );
    }
  }, [collections, loading]);

  if (loading) {
    return (
      <section className="w-full py-20 px-8 lg:px-16">
        <div className="container mx-auto">
          <h2 className="text-3xl lg:text-4xl font-display tracking-wider text-foreground/90 mb-16 text-center">
            Loading Collections...
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!collections.length) {
    return (
      <section className="w-full py-20 px-8 lg:px-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-display tracking-wider text-foreground/90 mb-8">
            No Collections Available
          </h2>
          <p className="text-muted-foreground">
            No collections are currently available.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="collections-section" ref={sectionRef} className="w-full py-20 px-8 lg:px-16">
      <div className="container mx-auto">
        <div ref={titleRef} className="text-center mb-16 opacity-0">
          <h2 className="text-3xl lg:text-4xl font-display tracking-wider text-foreground/90 mb-4">
            Collections
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('collections.subtitle', { defaultValue: 'Explore our curated eyewear collections, each designed to reflect your unique style and personality' })}
          </p>
        </div>
        
        <div ref={gridRef} className="relative max-w-7xl mx-auto">
          <Carousel
            opts={{ loop: true, align: "start", dragFree: true, skipSnaps: true }}
            className="w-full"
          >
            <CarouselContent>
              {collections.slice(0, 12).map((collection) => (
                <CarouselItem key={collection.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <Link 
                    to={`/collections/${collection.id}`}
                    className="group block collection-card opacity-0"
                  >
                    <div className="relative overflow-hidden bg-card rounded-none shadow-sm hover:shadow-xl transition-all duration-500 ease-out">
                      <div className="relative aspect-square overflow-hidden">
                        {(() => {
                          const imgUrl = collection.metadata?.imgUrl;
                          return imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={collection.title}
                              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                              loading="lazy"
                              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                              width="1400"
                              height="1400"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-400">No image available</span>
                              <small className="mt-2 text-xs text-gray-400">Collection ID: {collection.id}</small>
                            </div>
                          );
                        })()}
                        
                        {/* Overlay gradient for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                        {/* Text overlay inside image */}
                        <div className="absolute left-4 right-4 bottom-4 md:left-6 md:right-6 md:bottom-6">
                          <h3 className="font-display text-xl lg:text-2xl font-bold text-white drop-shadow">
                            {collection.title}
                          </h3>
                          <div className="mt-2 flex items-center text-white font-medium text-sm">
                            <span>Explore Collection</span>
                            <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-6 sm:-left-10" />
            <CarouselNext className="-right-6 sm:-right-10" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}