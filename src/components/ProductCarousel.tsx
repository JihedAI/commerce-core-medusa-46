import React, { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { sdk } from "@/lib/sdk";
import { formatPrice } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useRegion } from "@/contexts/RegionContext";
import Autoplay from "embla-carousel-autoplay";

interface ProductCarouselProps {
  initialCount?: number;
}

export default function ProductCarousel({ initialCount = 6 }: ProductCarouselProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [tagName, setTagName] = useState<string>("Featured Products");
  const navigate = useNavigate();
  const { currentRegion } = useRegion();
  const plugin = React.useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  const TAG_ID = 'ptag_01K5RXNQQETCANE08W17PCH6MB';

  useEffect(() => {
    if (!currentRegion) return;

    sdk.store.product.list({
      tag_id: TAG_ID,
      limit: initialCount,
      region_id: currentRegion.id,
      fields: "+thumbnail,+images,+tags,+variants"
    }).then(({ products }) => {
      setProducts(products.slice(0, initialCount));
      if (products[0]?.tags) {
        const tagObj = products[0].tags.find((tag: any) => tag.id === TAG_ID);
        if (tagObj) setTagName(tagObj.value || "Featured Products");
      }
    }).catch(() => setProducts([]));
  }, [currentRegion, initialCount]);

  if (!products.length) return null;

  return (
    <section className="w-full py-20 px-8 lg:px-16">
      <h2 className="text-3xl lg:text-4xl font-display tracking-wider text-foreground/90 mb-12 text-center">
        {tagName}
      </h2>
      <div className="carousel-container relative">
        <Carousel
          opts={{ align: "start", loop: true }}
          plugins={[plugin.current]}
          className="w-full"
        >
          <CarouselContent className="-ml-8">
            {products.map((product) => (
              <CarouselItem key={product.id} className="pl-8 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div
                  onClick={() => navigate(`/products/${product.handle}`)}
                  className="relative aspect-[3/4] cursor-pointer overflow-hidden group/item"
                >
                  <img
                    src={product.thumbnail || product.images?.[0]?.url || "/placeholder.svg"}
                    alt={product.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                  />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-sm font-sans tracking-wide text-foreground/90 mb-1">
                      {product.title}
                    </p>
                    <p className="text-xs font-light text-foreground/70">
                      {(() => {
                        const variant = product.variants?.[0];
                        if (!variant) return "Price N/A";
                        const price = variant.calculated_price?.calculated_amount ||
                                      variant.prices?.[0]?.amount || 0;
                        const currency = variant.calculated_price?.currency_code || 
                                         variant.prices?.[0]?.currency_code || "USD";
                        return formatPrice(price, currency);
                      })()}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CarouselNext className="-right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Carousel>
      </div>
    </section>
  );
}
