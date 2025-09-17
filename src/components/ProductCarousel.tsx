import React, { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { medusa } from "@/lib/medusa";
import { formatPrice } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";

export default function ProductCarousel() {
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { products } = await medusa.products.list({ limit: 10 });
        setProducts(products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  if (!products.length) return null;

  return (
    <section className="w-full section-spacing container-padding">
      <h2 className="text-fluid-3xl lg:text-fluid-4xl font-display tracking-wider text-foreground/90 mb-8 sm:mb-12 text-center">
        Our Latest Products
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
          <CarouselContent className="-ml-3 sm:-ml-4 lg:-ml-8">
            {products.map((product) => (
              <CarouselItem 
                key={product.id} 
                className="pl-3 sm:pl-4 lg:pl-8 basis-full xs:basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              >
                <div
                  onClick={() => navigate(`/products/${product.handle}`)}
                  className="relative aspect-[3/4] cursor-pointer overflow-hidden group/item touch-target"
                >
                  {/* Product Image - Responsive */}
                  <img
                    src={product.thumbnail || product.images?.[0]?.url || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover transition-all duration-700 ease-out group-hover/item:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />
                  
                  {/* Product Info - Responsive positioning */}
                  <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                    <p className="text-fluid-sm font-sans tracking-wide text-foreground/90 mb-1 truncate">
                      {product.title}
                    </p>
                    <p className="text-fluid-xs font-light text-foreground/70">
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
          
          {/* Navigation Arrows - Touch-friendly and responsive */}
          <CarouselPrevious className="-left-4 sm:-left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/10 backdrop-blur-sm border-border hover:bg-background/20 hover:border-border touch-target" />
          <CarouselNext className="-right-4 sm:-right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/10 backdrop-blur-sm border-border hover:bg-background/20 hover:border-border touch-target" />
        </Carousel>
      </div>
    </section>
  );
}