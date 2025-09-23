import React, { useEffect, useState, useRef } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { sdk } from "@/lib/sdk";
import { formatPrice } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useRegion } from "@/contexts/RegionContext";
import Autoplay from "embla-carousel-autoplay";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ProductCarousel() {
  const [products, setProducts] = useState<any[]>([]);
  const [tagName, setTagName] = useState<string>("Featured Products");
  const navigate = useNavigate();
  const { currentRegion } = useRegion();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const TAG_ID = 'ptag_01K5RXNQQETCANE08W17PCH6MB';

  useEffect(() => {
    const fetchProductsAndTag = async () => {
      if (!currentRegion) {
        console.log("No region available yet, waiting...");
        return;
      }

      try {
        console.log("🔍 Fetching products with region:", currentRegion.id);
        
        // Fetch products with the specific tag and region context
        const { products } = await sdk.store.product.list({
          tag_id: TAG_ID,
          limit: 10,
          region_id: currentRegion.id,
          fields: "+thumbnail,+images,+tags,+variants,+variants.prices,+variants.calculated_price"
        });
        
        console.log("✅ Fetched products by tag:", products.length);
        console.log("🔍 Sample product data:", JSON.stringify(products[0], null, 2));
        
        if (products[0]?.variants) {
          console.log("💰 First product variants:", JSON.stringify(products[0].variants, null, 2));
        }
        
        // Get tag name from the first product's tags if available
        if (products.length > 0 && products[0].tags) {
          const tagObj = products[0].tags.find((tag: any) => tag.id === TAG_ID);
          if (tagObj) {
            setTagName(tagObj.value || "Featured Products");
          }
        }
        
        setProducts(products);
      } catch (error) {
        console.error("❌ Failed to fetch products by tag:", error);
        // Fallback to regular product fetch if tag filtering fails
        try {
          console.log("🔄 Trying fallback approach...");
          const { products } = await sdk.store.product.list({ 
            limit: 10,
            region_id: currentRegion.id,
            fields: "+thumbnail,+images,+variants,+variants.prices,+variants.calculated_price"
          });
          console.log("✅ Fallback products fetched:", products.length);
          console.log("💰 Fallback sample product:", JSON.stringify(products[0], null, 2));
          setProducts(products);
        } catch (fallbackError) {
          console.error("❌ Fallback fetch also failed:", fallbackError);
        }
      }
    };
    fetchProductsAndTag();
  }, [currentRegion]);

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  // GSAP animation on mount - MUST be called before any early returns
  useEffect(() => {
    if (products.length > 0 && sectionRef.current && titleRef.current) {
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
      .fromTo(sectionRef.current.querySelector('.carousel-container'), 
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.4"
      );
    }
  }, [products.length]);

  // Early return AFTER all hooks are called
  if (!products.length) return null;

  return (
    <section ref={sectionRef} className="w-full py-20 px-8 lg:px-16">
      <h2 ref={titleRef} className="text-3xl lg:text-4xl font-display tracking-wider text-foreground/90 mb-12 text-center">
        {tagName}
      </h2>
      
      <div className="carousel-container relative group opacity-0">
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
                      {(() => {
                        const variant = product.variants?.[0];
                        if (!variant) {
                          console.log("⚠️ No variants found for product:", product.title);
                          return "Price not available";
                        }
                        
                        // Try different price sources
                        const calculatedPrice = variant.calculated_price?.calculated_amount;
                        const regionPrice = currentRegion && variant.prices?.find((p: any) => 
                          p.currency_code === currentRegion.currency_code
                        );
                        const firstPrice = variant.prices?.[0];
                        
                        console.log(`💰 Price debug for ${product.title}:`, {
                          calculatedPrice,
                          regionPrice: regionPrice?.amount,
                          firstPrice: firstPrice?.amount,
                          currentRegion: currentRegion?.currency_code
                        });
                        
                        const amount = calculatedPrice || regionPrice?.amount || firstPrice?.amount || 0;
                        const currency = variant.calculated_price?.currency_code || 
                                       regionPrice?.currency_code || 
                                       firstPrice?.currency_code || 
                                       currentRegion?.currency_code || "USD";
                        
                        return formatPrice(amount, currency);
                      })()}
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