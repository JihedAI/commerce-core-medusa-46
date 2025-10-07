import React, { useMemo, memo } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useProductCarousel } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useRegion } from "@/contexts/RegionContext";
import { useTranslation } from "react-i18next";
import Autoplay from "embla-carousel-autoplay";
import OptimizedImage from "@/components/OptimizedImage";

interface ProductCarouselProps {
  initialCount?: number;
}

// === Product Card ===
const CarouselProductCard = memo(
  ({ product, onClick }: { product: any; onClick: () => void }) => {
    const price = useMemo(() => {
      const variant = product.variants?.[0];
      if (!variant) return "Price N/A";
      const amount =
        variant.calculated_price?.calculated_amount ||
        variant.prices?.[0]?.amount ||
        0;
      const currency =
        variant.calculated_price?.currency_code ||
        variant.prices?.[0]?.currency_code ||
        "USD";
      return formatPrice(amount, currency);
    }, [product]);

    return (
      <a
        onClick={onClick}
        className="relative block cursor-pointer group/item"
      >
        {/* Image Container */}
        <div className="relative overflow-hidden w-[390px] h-[300px] mobile:w-[140px] mobile:h-[238px] rounded-xl">
          <figure className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[776px] h-[776px] mobile:w-[238px] mobile:h-[238px] transition-transform duration-700 group-hover/item:scale-110">
            <OptimizedImage
              src={
                product.thumbnail ||
                product.images?.[0]?.url ||
                "/placeholder.svg"
              }
              alt={product.title}
              className="w-full h-full object-cover"
              quality={80}
              priority={false}
              fit="cover"
            />
          </figure>
        </div>

        {/* Text Block BELOW the image */}
        <div className="px-[28px] mobile:px-[12px] mt-4">
          <h3 className="text-sm md:text-base font-sans tracking-wide text-foreground line-clamp-1 leading-tight">
            {product.title}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">{price}</p>
        </div>
      </a>
    );
  }
);

CarouselProductCard.displayName = "CarouselProductCard";

// === Carousel Component ===
export default function ProductCarousel({ initialCount = 8 }: ProductCarouselProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentRegion } = useRegion();

   const plugin = useMemo(
     () =>
       Autoplay({
         delay: 2500, // slightly faster cadence but smooth with long duration
         stopOnInteraction: true,
         stopOnMouseEnter: true,
       }),
     []
   );

  const TAG_ID = "ptag_01K5RXNQQETCANE08W17PCH6MB";

  const { data: carouselData } = useProductCarousel(
    TAG_ID,
    currentRegion?.id,
    Math.max(8, initialCount),
    {
      staleTime: 10 * 60 * 1000,
    }
  );

  const products = useMemo(() => carouselData?.products || [], [carouselData]);

  const tagName = useMemo(() => {
    if (products.length > 0 && products[0]?.tags) {
      const tagObj = products[0].tags.find((tag: any) => tag.id === TAG_ID);
      return tagObj?.value || "Featured Products";
    }
    return "Featured Products";
  }, [products, TAG_ID]);

  if (!products.length) return null;

  return (
    <section className="w-full py-20 px-0">
      <div className="px-8 lg:px-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-display tracking-wider text-foreground/90 mb-4">
            {tagName}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('products.featuredSubtitle', { defaultValue: 'Discover our handpicked selection of premium eyewear, crafted with precision and designed for the modern lifestyle' })}
          </p>
        </div>
      </div>
      <div className="carousel-container relative group w-full">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              skipSnaps: false,
              dragFree: true,
              duration: 30, // smoother animation timing for auto-scroll
            }}
            plugins={[plugin]}
            className="w-full"
          >
          <CarouselContent className="-mx-4 sm:-mx-6">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
  className="px-4 sm:px-6 mx-3 basis-auto w-[390px] mobile:w-[140px] first:ml-4 sm:first:ml-6 last:mr-4 sm:last:mr-6"
              >
                <CarouselProductCard
                  product={product}
                  onClick={() => navigate(`/products/${product.handle}`)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Arrows appear on hover */}
          <CarouselPrevious className="-left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CarouselNext className="-right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Carousel>
      </div>
    </section>
  );
}
