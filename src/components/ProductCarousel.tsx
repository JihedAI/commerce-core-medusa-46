import React, { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { sdk } from "@/lib/sdk";
import { formatPrice } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";

export default function ProductCarousel() {
  const [products, setProducts] = useState<any[]>([]);
  const [tagName, setTagName] = useState<string>("Featured Products");
  const navigate = useNavigate();

  const TAG_ID = 'ptag_01K59Z4GH70D2TG7P1DAFH844Q';

  useEffect(() => {
    const fetchProductsAndTag = async () => {
      try {
        // Fetch products with the specific tag using query parameters
        const { products } = await sdk.store.product.list({
          tag_id: TAG_ID,
          limit: 10,
          fields: "+thumbnail,+images,+tags"
        });
        
        console.log("Fetched products by tag:", products.length);
        
        // Get tag name from the first product's tags if available
        if (products.length > 0 && products[0].tags) {
          const tagObj = products[0].tags.find((tag: any) => tag.id === TAG_ID);
          if (tagObj) {
            setTagName(tagObj.value || "Featured Products");
          }
        }
        
        setProducts(products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        // Fallback to regular product fetch if tag filtering fails
        try {
          const { products } = await sdk.store.product.list({ limit: 10 });
          setProducts(products);
        } catch (fallbackError) {
          console.error("Fallback fetch also failed:", fallbackError);
        }
      }
    };
    fetchProductsAndTag();
  }, []);

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  if (!products.length) return null;

  return (
    <section className="w-full py-20 px-8 lg:px-16">
      <h2 className="text-3xl lg:text-4xl font-display tracking-wider text-foreground/90 mb-12 text-center">
        {tagName}
      </h2>
      
      <div className="relative group">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[plugin.current]}
          className="w-full"
        >
          <CarouselContent className="-ml-8">
            {products.map((product) => (
              <CarouselItem 
                key={product.id} 
                className="pl-8 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <div
                  onClick={() => navigate(`/products/${product.handle}`)}
                  className="relative aspect-[3/4] cursor-pointer overflow-hidden group/item"
                >
                  {/* Product Image */}
                  <img
                    src={product.thumbnail || product.images?.[0]?.url || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover transition-all duration-700 ease-out group-hover/item:scale-105"
                  />
                  
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />
                  
                  {/* Product Info */}
                  <div className="absolute bottom-4 left-4">
                    <p className="text-sm font-sans tracking-wide text-foreground/90 mb-1">
                      {product.title}
                    </p>
                    <p className="text-xs font-light text-foreground/70">
                      {formatPrice(
                        product.variants?.[0]?.prices?.[0]?.amount || 0,
                        product.variants?.[0]?.prices?.[0]?.currency_code || "USD"
                      )}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation Arrows - Only visible on hover */}
          <CarouselPrevious className="-left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/10 backdrop-blur-sm border-foreground/10 hover:bg-background/20 hover:border-foreground/20" />
          <CarouselNext className="-right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/10 backdrop-blur-sm border-foreground/10 hover:bg-background/20 hover:border-foreground/20" />
        </Carousel>
      </div>
    </section>
  );
}