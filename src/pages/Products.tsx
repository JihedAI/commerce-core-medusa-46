import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ChevronDown, Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";
import ProductCard from "@/components/ProductCard";
import Layout from "@/components/Layout";
import { useRegion } from "@/contexts/RegionContext";

export default function Products() {
  const { id: categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentRegion } = useRegion();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const sort = searchParams.get("sort") || "created_at";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 12;

  // Fetch products using the new SDK
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products", categoryId, sort, page, selectedCollections, currentRegion?.id],
    queryFn: async () => {
      if (!currentRegion) return { products: [], count: 0 };
      
      const params: any = {
        limit,
        offset: (page - 1) * limit,
        fields: "*variants,*variants.calculated_price,*images,*collection,*categories"
      };

      // Add sorting
      if (sort === "created_at") {
        params.created_at = { $gte: "1970-01-01" }; // Default ascending
      } else if (sort === "-created_at") {
        params.order = "-created_at";
      } else if (sort === "title") {
        params.order = "title";
      } else if (sort === "-title") {
        params.order = "-title";
      }

      if (categoryId) {
        params.category_id = [categoryId];
      }

      if (selectedCollections.length > 0) {
        params.collection_id = selectedCollections;
      }

      // Add region context for pricing
      if (currentRegion?.id) {
        params.region_id = currentRegion.id;
      }

      const { products, count } = await sdk.store.product.list(params);
      return { products: products || [], count: count || 0 };
    },
    enabled: !!currentRegion,
  });

  // Fetch categories for filters using the new SDK
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { product_categories } = await sdk.store.category.list({
        limit: 100,
        fields: "id,name,handle"
      });
      return product_categories || [];
    },
  });

  // Fetch collections for filters using the new SDK
  const { data: collectionsData } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { collections } = await sdk.store.collection.list({
        limit: 100,
        fields: "id,title,handle"
      });
      return collections || [];
    },
  });

  const handleSortChange = (value: string) => {
    setSearchParams({ ...Object.fromEntries(searchParams), sort: value });
  };

  const handleCollectionToggle = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const totalPages = Math.ceil((productsData?.count || 0) / limit);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">
            {categoryId && categoriesData
              ? categoriesData.find((c) => c.id === categoryId)?.name || "Products"
              : "All Products"}
          </h1>
          <p className="text-muted-foreground">
            {productsData?.count || 0} products found
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 flex gap-2">
            {/* Mobile Filter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="sm:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <FilterContent
                  categories={categoriesData}
                  collections={collectionsData}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  selectedCollections={selectedCollections}
                  handleCollectionToggle={handleCollectionToggle}
                />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex gap-2">
            {/* Sort */}
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Newest</SelectItem>
                <SelectItem value="-created_at">Oldest</SelectItem>
                <SelectItem value="title">Name (A-Z)</SelectItem>
                <SelectItem value="-title">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="hidden sm:flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden sm:block w-64 flex-shrink-0">
            <FilterContent
              categories={categoriesData}
              collections={collectionsData}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedCollections={selectedCollections}
              handleCollectionToggle={handleCollectionToggle}
            />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : productsData?.products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No products found</p>
                <Button onClick={() => window.location.href = "/products"}>
                  View All Products
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {productsData?.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: String(page - 1),
                        })
                      }
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={i}
                          variant={page === pageNum ? "default" : "outline"}
                          onClick={() =>
                            setSearchParams({
                              ...Object.fromEntries(searchParams),
                              page: String(pageNum),
                            })
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      onClick={() =>
                        setSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: String(page + 1),
                        })
                      }
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function FilterContent({
  categories,
  collections,
  priceRange,
  setPriceRange,
  selectedCollections,
  handleCollectionToggle,
}: any) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      {categories && categories.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.map((category: any) => (
              <a
                key={category.id}
                href={`/categories/${category.id}`}
                className="block text-sm hover:text-primary transition-colors"
              >
                {category.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Collections */}
      {collections && collections.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Collections</h3>
          <div className="space-y-2">
            {collections.map((collection: any) => (
              <div key={collection.id} className="flex items-center space-x-2">
                <Checkbox
                  id={collection.id}
                  checked={selectedCollections.includes(collection.id)}
                  onCheckedChange={() => handleCollectionToggle(collection.id)}
                />
                <Label
                  htmlFor={collection.id}
                  className="text-sm font-normal cursor-pointer"
                >
                  {collection.title}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={1000}
          step={10}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>
    </div>
  );
}