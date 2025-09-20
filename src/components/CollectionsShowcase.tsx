import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";

// Collection Image URLs - Easy to modify
const COLLECTION_IMAGE_1 = "https://images.pexels.com/photos/27055609/pexels-photo-27055609.jpeg";
const COLLECTION_IMAGE_2 = "https://images.pexels.com/photos/12678272/pexels-photo-12678272.jpeg";
const DEFAULT_COLLECTION_IMAGE = COLLECTION_IMAGE_1;

export default function CollectionsShowcase() {
  // Collection images mapping - using const URLs above
  const collectionImages: Record<string, string> = {
    "sunglasses": COLLECTION_IMAGE_1,
    "contact-lenses": COLLECTION_IMAGE_2, 
    "men": COLLECTION_IMAGE_1,
    "women": COLLECTION_IMAGE_2,
    "frames": COLLECTION_IMAGE_1,
    "reading": COLLECTION_IMAGE_2,
    "eyeglasses": COLLECTION_IMAGE_1,
    "optical": COLLECTION_IMAGE_2
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
    
    // Default fallback image - using default constant
    return DEFAULT_COLLECTION_IMAGE;
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