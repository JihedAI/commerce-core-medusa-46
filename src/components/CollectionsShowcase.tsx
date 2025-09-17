import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";

export default function CollectionsShowcase() {
  const { data: collections, isLoading } = useQuery({
    queryKey: ["featured-collections"],
    queryFn: async () => {
      const { collections } = await sdk.store.collection.list({ limit: 6 });
      return collections;
    },
  });

  if (isLoading) {
    return (
      <section className="w-full section-spacing container-padding">
        <div className="container mx-auto">
          <h2 className="text-fluid-3xl lg:text-fluid-4xl font-display tracking-wider text-foreground/90 mb-12 sm:mb-16 text-center">
            Collections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!collections?.length) return null;

  return (
    <section className="w-full section-spacing container-padding">
      <div className="container mx-auto">
        <h2 className="text-fluid-3xl lg:text-fluid-4xl font-display tracking-wider text-foreground/90 mb-12 sm:mb-16 text-center">
          Collections
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {collections.slice(0, 6).map((collection, index) => (
            <Link 
              key={collection.id} 
              to={`/collections/${collection.id}`}
              className="group block touch-target"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-muted rounded-lg">
                {/* Collection Image */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/30">
                  {/* Placeholder gradient since collections might not have images */}
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out" />
                
                {/* Content - Responsive spacing */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8">
                  {/* Collection Title */}
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <h3 className="font-display text-fluid-xl lg:text-fluid-3xl font-bold text-foreground mb-2 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                      {collection.title}
                    </h3>
                    
                    {collection.metadata?.description && (
                      <p className="text-fluid-sm text-foreground/70 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-100">
                        {collection.metadata.description as string}
                      </p>
                    )}
                    
                    {/* Hover indicator */}
                    <div className="w-0 group-hover:w-8 sm:group-hover:w-12 h-[2px] bg-primary mt-4 transition-all duration-500 delay-200" />
                  </div>
                </div>
                
                {/* Zoom effect overlay */}
                <div className="absolute inset-0 bg-background/5 scale-100 group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}