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