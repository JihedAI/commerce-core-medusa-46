import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CollectionsShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Get image for collection from metadata - only show collections with images
  const getCollectionImage = (collection: any) => {
    // Only return imgUrl from metadata if it exists
    if (collection.metadata?.imgUrl && typeof collection.metadata.imgUrl === 'string') {
      return collection.metadata.imgUrl;
    }
    return null; // No fallback - we'll filter these out
  };
  const { data: collections, isLoading } = useQuery({
    queryKey: ["featured-collections", "with-metadata"],
    queryFn: async () => {
      console.log("🔧 Trying different SDK approaches to get metadata...");
      
      // Try 1: Use the older medusa client first
      try {
        const { medusa } = await import("@/lib/medusa");
        const response = await medusa.collections.list({ limit: 20 });
        console.log("✅ Method 1 (old medusa client):", response.collections?.[0]);
        if (response.collections?.[0]?.metadata) {
          console.log("🎉 Found metadata with old client!");
          return response.collections;
        }
      } catch (error) {
        console.log("❌ Method 1 (old client) failed:", error);
      }

      // Try 2: Basic SDK call and log what we get
      const { collections } = await sdk.store.collection.list({ limit: 20 });
      console.log("🔍 Method 2 - V2 SDK Raw collections data:", collections);
      
      // Debug each collection's metadata
      collections?.forEach((collection, index) => {
        console.log(`📦 Collection ${index + 1}:`, {
          id: collection.id,
          title: collection.title,
          metadata: collection.metadata,
          hasImgUrl: !!collection.metadata?.imgUrl,
          allKeys: Object.keys(collection)
        });
      });
      
      return collections;
    },
    staleTime: 0, // Force fresh data
    refetchOnMount: true, // Always refetch on mount
  });

  if (isLoading) {
    return (
      <section className="w-full py-20 px-8 lg:px-16">
        <div className="container mx-auto">
          <h2 className="text-3xl lg:text-4xl font-display tracking-wider text-foreground/90 mb-16 text-center">
            Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!collections?.length) return null;

  // GSAP animations
  useEffect(() => {
    if (sectionRef.current && titleRef.current && gridRef.current) {
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
  }, [collections]);

  return (
    <section ref={sectionRef} className="w-full py-20 px-8 lg:px-16">
      <div className="container mx-auto">
        <h2 ref={titleRef} className="text-3xl lg:text-4xl font-display tracking-wider text-foreground/90 mb-16 text-center opacity-0">
          Collections
        </h2>
        
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {collections
            .filter(collection => getCollectionImage(collection)) // Only show collections with metadata images
            .slice(0, 6)
            .map((collection, index) => (
            <Link 
              key={collection.id} 
              to={`/collections/${collection.id}`}
              className="group block collection-card opacity-0"
            >
              <div className="relative overflow-hidden bg-card rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 ease-out">
                {/* Collection Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={getCollectionImage(collection)}
                    alt={collection.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" />
                </div>
                
                {/* Content Card */}
                <div className="p-6 space-y-3">
                  {/* Collection Title */}
                  <h3 className="font-display text-xl lg:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {collection.title}
                  </h3>
                  
                  {/* Collection Description */}
                  {collection.metadata?.description ? (
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {collection.metadata.description as string}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Discover our curated selection of premium products
                    </p>
                  )}
                  
                  {/* Call to Action */}
                  <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-1 transition-transform duration-300">
                    <span>Explore Collection</span>
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}