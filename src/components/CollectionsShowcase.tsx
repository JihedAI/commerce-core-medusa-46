import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";

export default function CollectionsShowcase() {
  // Collection images mapping
  const collectionImages: Record<string, string> = {
    "sunglasses": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=1000&fit=crop",
    "contact-lenses": "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&h=1000&fit=crop", 
    "men": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop",
    "women": "https://images.unsplash.com/photo-1494790108755-2616c95f2e1e?w=800&h=1000&fit=crop",
    "frames": "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=1000&fit=crop",
    "reading": "https://images.unsplash.com/photo-1559087867-ce4c91325525?w=800&h=1000&fit=crop"
  };

  // Get image for collection based on handle or title
  const getCollectionImage = (collection: any) => {
    const handle = collection.handle?.toLowerCase() || '';
    const title = collection.title?.toLowerCase() || '';
    
    // First try to match by handle
    if (collectionImages[handle]) {
      return collectionImages[handle];
    }
    
    // Then try to match by keywords in title
    for (const [key, imageUrl] of Object.entries(collectionImages)) {
      if (title.includes(key) || handle.includes(key)) {
        return imageUrl;
      }
    }
    
    // Default fallback image
    return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=1000&fit=crop";
  };
  const { data: collections, isLoading } = useQuery({
    queryKey: ["featured-collections"],
    queryFn: async () => {
      const { collections } = await sdk.store.collection.list({ limit: 6 });
      return collections;
    },
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

  return (
    <section className="w-full py-20 px-8 lg:px-16">
      <div className="container mx-auto">
        <h2 className="text-3xl lg:text-4xl font-display tracking-wider text-foreground/90 mb-16 text-center">
          Collections
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {collections.slice(0, 6).map((collection, index) => (
            <Link 
              key={collection.id} 
              to={`/collections/${collection.id}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-muted rounded-lg">
                {/* Collection Image */}
                <img
                  src={getCollectionImage(collection)}
                  alt={collection.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  {/* Collection Title */}
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                      {collection.title}
                    </h3>
                    
                    {collection.metadata?.description && (
                      <p className="text-sm text-foreground/70 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-100">
                        {collection.metadata.description as string}
                      </p>
                    )}
                    
                    {/* Hover indicator */}
                    <div className="w-0 group-hover:w-12 h-[2px] bg-primary mt-4 transition-all duration-500 delay-200" />
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