import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";
import ProductCard from "@/components/ProductCard";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useRegion } from "@/contexts/RegionContext";
import { HttpTypes } from "@medusajs/types";

export default function CollectionProducts() {
  const { id } = useParams<{ id: string }>();
  const { currentRegion } = useRegion();

  const { data: collection, isLoading: collectionLoading } = useQuery({
    queryKey: ["collection", id],
    queryFn: async () => {
      if (!id) return null;
      const { collection } = await sdk.store.collection.retrieve(id);
      return collection;
    },
    enabled: !!id,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["collection-products", id, currentRegion?.id],
    queryFn: async () => {
      if (!id) return [];
      const { products } = await sdk.store.product.list({ 
        collection_id: [id],
        region_id: currentRegion?.id,
        fields: "id,title,handle,thumbnail,*variants,*variants.calculated_price,*images,*collection,*categories",
        limit: 100
      });
      return products;
    },
    enabled: !!id && !!currentRegion?.id,
  });

  const isLoading = collectionLoading || productsLoading;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Collection Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">
            {collection?.title || "Collection"}
          </h1>
          {collection?.metadata?.description && (
            <p className="text-muted-foreground">
              {collection.metadata.description as string}
            </p>
          )}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
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