import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";
import { useRelatedProducts } from "@/hooks/useProducts";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useRegion } from "@/contexts/RegionContext";
import { HttpTypes } from "@medusajs/types";
import OptimizedImage from "@/components/OptimizedImage";
import Typewriter from "@/components/Typewriter";
import { formatPrice } from "@/lib/utils";

export default function CollectionProducts() {
  const { id } = useParams<{ id: string }>(); // here `id` will actually be the handle now
  const { currentRegion } = useRegion();

  // First resolve collection by handle
  const { data: collection, isLoading: collectionLoading } = useQuery({
    queryKey: ["collection_by_handle", id],
    queryFn: async () => {
      if (!id) return null;
      // list by handle filter then take first
      const { collections } = await sdk.store.collection.list({ handle: id, fields: "id,title,handle,metadata" } as any);
      return collections?.[0] ?? null;
    },
    enabled: !!id,
  });

  const collectionId = collection?.id || "";

  const { data: productsData, isLoading: productsLoading } = useRelatedProducts(
    collectionId, 
    currentRegion?.id, 
    100
  );
  
  const products = productsData?.products || [];

  const isLoading = collectionLoading || productsLoading;

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="w-full">
        <div className="relative w-full aspect-[215/312] md:aspect-[32/15] overflow-hidden">
          {collectionLoading ? (
            <Skeleton className="absolute inset-0 w-full h-full" />
          ) : (
            <>
              {(() => {
                const meta = collection?.metadata as Record<string, any> | undefined;
                const imgUrl = meta?.imgUrl || meta?.imageUrl || meta?.bannerUrl;
                return imgUrl ? (
                <img
                  src={String(imgUrl)}
                  alt={collection?.title || "Collection"}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  loading="eager"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-muted" />
              );})()}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute left-4 right-4 bottom-6 md:left-10 md:right-10 md:bottom-10">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-white drop-shadow-md">
                  {collection?.title || "Collection"}
                </h1>
                {collection?.metadata?.description && (
                  <p className="mt-2 max-w-3xl text-white/90 text-sm md:text-base">
                    <Typewriter text={String(collection.metadata.description)} startDelayMs={200} />
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {products.map((product) => (
              <CollectionGridProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found in this collection.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Product card styled like the homepage product carousel
function CollectionGridProductCard({ product }: { product: any }) {
  const navigate = useNavigate();

  const priceInfo = useMemo(() => {
    const variant = product.variants?.[0];
    if (!variant) return { current: null, original: null };
    
    const calculatedPrice = variant.calculated_price;
    const currentAmount =
      calculatedPrice?.calculated_amount_with_tax ||
      calculatedPrice?.calculated_amount ||
      variant.prices?.[0]?.amount ||
      0;
    const originalAmount = 
      calculatedPrice?.original_amount_with_tax ||
      calculatedPrice?.original_amount;
    const currency =
      calculatedPrice?.currency_code ||
      variant.prices?.[0]?.currency_code ||
      "USD";
    
    return {
      current: formatPrice(currentAmount, currency),
      original: originalAmount && originalAmount !== currentAmount 
        ? formatPrice(originalAmount, currency)
        : null
    };
  }, [product]);

  return (
    <a
      onClick={() => navigate(`/products/${product.handle}`)}
      className="relative block cursor-pointer group/item"
    >
      {/* Image Container - larger like carousel */}
      <div className="relative overflow-hidden w-[390px] h-[300px] md:w-[420px] md:h-[340px] xl:w-[460px] xl:h-[380px] mx-auto rounded-xl">
        <figure className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[776px] h-[776px] transition-transform duration-700 group-hover/item:scale-150">
          <OptimizedImage
            src={
              product.thumbnail || product.images?.[0]?.url || "/placeholder.svg"
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
      <div className="mt-3 px-1 flex flex-col items-center">
        <h3 className="text-sm md:text-base font-sans tracking-wide text-foreground line-clamp-1 leading-tight">
          {product.title}
        </h3>
        {priceInfo.current && (
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs md:text-sm font-medium text-foreground">{priceInfo.current}</p>
            {priceInfo.original && (
              <p className="text-xs text-muted-foreground line-through">{priceInfo.original}</p>
            )}
          </div>
        )}
      </div>
    </a>
  );
}