import React, { useMemo, memo } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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
const CarouselProductCard = memo(({ product, onClick }: { product: any; onClick: () => void }) => {
  const priceInfo = useMemo(() => {
    const variant = product.variants?.[0];
    if (!variant) return { current: "Price N/A", original: null, currency: "USD" };

    const calculatedPrice = variant.calculated_price;
    const currentAmount =
      calculatedPrice?.calculated_amount_with_tax ||
      calculatedPrice?.calculated_amount ||
      variant.prices?.[0]?.amount ||
      0;
    const originalAmount = calculatedPrice?.original_amount_with_tax || calculatedPrice?.original_amount;
    const currency = calculatedPrice?.currency_code || variant.prices?.[0]?.currency_code || "USD";

    return {
      current: formatPrice(currentAmount, currency),
      original: originalAmount && originalAmount !== currentAmount ? formatPrice(originalAmount, currency) : null,
      currency,
    };
  }, [product]);

  return (
    <a onClick={onClick} className="relative block cursor-pointer group/item">
      {/* Responsive: Mobile 2 per view, Tablet 3 per view, Desktop full carousel */}
      <div className="relative overflow-hidden w-full h-[200px] sm:h-[280px] md:h-[320px] lg:w-[390px] lg:h-[300px] rounded-xl">
        {/* Responsive image scaling */}
        <figure className="absolute inset-0 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full h-full sm:w-[620px] sm:h-[620px] md:w-[700px] md:h-[700px] lg:w-[776px] lg:h-[776px] transition-transform duration-700 group-hover/item:scale-150">
          <OptimizedImage
            src={product.thumbnail || product.images?.[0]?.url || "/placeholder.svg"}
            alt={product.title}
            className="w-full h-full object-cover"
            quality={80}
            priority={false}
            fit="cover"
          />
        </figure>
      </div>

      {/* Text Block BELOW the image */}
      <div className="px-[12px] sm:px-[20px] lg:px-[28px] mt-3 sm:mt-4">
        <h3 className="text-sm sm:text-base lg:text-lg font-sans tracking-wide text-foreground line-clamp-1 leading-tight text-center sm:text-left">
          {product.title}
        </h3>
        <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
          <p className="text-xs sm:text-sm lg:text-base font-medium text-foreground">{priceInfo.current}</p>
          {priceInfo.original && <p className="text-xs sm:text-sm text-muted-foreground line-through">{priceInfo.original}</p>}
        </div>
      </div>
    </a>
  );
});

CarouselProductCard.displayName = "CarouselProductCard";

// === Carousel Component ===
export default function ProductCarousel({ initialCount = 8 }: ProductCarouselProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentRegion } = useRegion();

  const plugin = useMemo(
    () =>
      Autoplay({
        delay: 2500,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    [],
  );

  const TAG_ID = "ptag_01K5RXNQQETCANE08W17PCH6MB";

  const { data: carouselData } = useProductCarousel(TAG_ID, currentRegion?.id, Math.max(8, initialCount), {
    staleTime: 10 * 60 * 1000,
  });

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
          <h2 className="text-3xl lg:text-4xl font-display tracking-wider text-foreground/90 mb-4">{tagName}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("products.featuredSubtitle", {
              defaultValue:
                "Discover our handpicked selection of premium eyewear, crafted with precision and designed for the modern lifestyle",
            })}
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
            duration: 30,
          }}
          plugins={[plugin]}
          className="w-full"
        >
          <CarouselContent className="-mx-2 sm:-mx-4 lg:-mx-6 flex">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="px-2 sm:px-4 lg:px-6 mx-1 sm:mx-2 lg:mx-3 flex-none w-1/2 sm:w-1/3 md:w-[340px] lg:w-[390px] first:ml-4 sm:first:ml-6 last:mr-4 sm:last:mr-6"
              >
                <CarouselProductCard product={product} onClick={() => navigate(`/products/${product.handle}`)} />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Arrows only on desktop */}
          <CarouselPrevious className="hidden sm:flex -left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CarouselNext className="hidden sm:flex -right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Carousel>
      </div>
    </section>
  );
}
