import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";
import Layout from "@/components/Layout";
import { HttpTypes } from "@medusajs/types";

export default function Collections() {
  const { data: collections, isLoading } = useQuery({
    queryKey: ["all-collections"],
    queryFn: async () => {
      const { collections } = await sdk.store.collection.list();
      return collections;
    },
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Collections</h1>
          <p className="text-muted-foreground">
            Explore our curated collections of premium products
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections?.map((collection) => (
              <Link key={collection.id} to={`/collections/${collection.id}`}>
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-video bg-gradient-hero relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-primary-foreground transition-colors">
                        {collection.title}
                      </h3>
                      {collection.metadata?.description && (
                        <p className="text-sm text-white/80 mb-4">
                          {collection.metadata.description as string}
                        </p>
                      )}
                      <div className="flex items-center text-white">
                        <span className="text-sm font-medium">Explore Collection</span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}