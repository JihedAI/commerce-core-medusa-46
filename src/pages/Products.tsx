import React, { useState, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";
import FloatingProductCard from "@/components/FloatingProductCard";
import Layout from "@/components/Layout";
import { useRegion } from "@/contexts/RegionContext";

export default function Products() {
  const { id: categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentRegion } = useRegion();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  // Fetch products using the new SDK
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products", categoryId, sortBy, page, selectedCollections, selectedCategories, currentRegion?.id],
    queryFn: async () => {
      if (!currentRegion) return { products: [], count: 0 };
      
      const params: any = {
        limit,
        offset: (page - 1) * limit,
        fields: "*variants,*variants.calculated_price,*images,*collection,*categories"
      };

      // Add sorting
      switch (sortBy) {
        case "price-low":
          params.order = "variants.calculated_price";
          break;
        case "price-high":
          params.order = "-variants.calculated_price";
          break;
        case "oldest":
          params.order = "created_at";
          break;
        case "a-z":
          params.order = "title";
          break;
        case "z-a":
          params.order = "-title";
          break;
        default:
          params.order = "-created_at";
      }

      if (categoryId) {
        params.category_id = [categoryId];
      }

      if (selectedCollections.length > 0) {
        params.collection_id = selectedCollections;
      }

      if (selectedCategories.length > 0) {
        params.category_id = selectedCategories;
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

  const handleCollectionToggle = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!productsData?.products) return [];
    
    return productsData.products.filter(product =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [productsData?.products, searchQuery]);

  const totalPages = Math.ceil((productsData?.count || 0) / limit);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Collections Pills Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-wrap gap-3 flex-1">
              {collectionsData?.slice(0, 6).map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => handleCollectionToggle(collection.id)}
                  className={`group px-6 py-3 backdrop-blur-sm border rounded-full transition-all duration-300 hover:scale-105 ${
                    selectedCollections.includes(collection.id)
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                      : 'bg-muted/50 border-border/50 hover:bg-muted/80'
                  }`}
                >
                  <span className={`text-sm font-medium transition-colors ${
                    selectedCollections.includes(collection.id)
                      ? 'text-primary-foreground'
                      : 'group-hover:text-primary'
                  }`}>
                    {collection.title}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Filter Icon */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-4 h-12 w-12 rounded-full bg-muted/50 backdrop-blur-sm border border-border/50 hover:bg-muted/80 transition-all duration-300"
                >
                  <Filter className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur-xl border-l border-border/50">
                <SheetHeader className="border-b border-border/50 pb-4">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-lg font-semibold">Filters</SheetTitle>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-4 w-4" />
                      </Button>
                    </SheetClose>
                  </div>
                </SheetHeader>
                
                <div className="py-6 space-y-8">
                  {/* Sort Options */}
                  <div>
                    <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Sort By</h3>
                    <div className="space-y-3">
                      {[
                        { value: "price-low", label: "Price: Low to High" },
                        { value: "price-high", label: "Price: High to Low" },
                        { value: "newest", label: "Newest to Oldest" },
                        { value: "oldest", label: "Oldest to Newest" },
                        { value: "a-z", label: "Alphabetical (A–Z)" },
                        { value: "z-a", label: "Alphabetical (Z–A)" },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="sort"
                            value={option.value}
                            checked={sortBy === option.value}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-4 h-4 text-primary"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Categories */}
                  {categoriesData && categoriesData.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Categories</h3>
                      <div className="space-y-3">
                        {categoriesData.map((category: any) => (
                          <div key={category.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={category.id}
                              checked={selectedCategories.includes(category.id)}
                              onCheckedChange={() => handleCategoryToggle(category.id)}
                            />
                            <Label htmlFor={category.id} className="text-sm cursor-pointer">
                              {category.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for a product…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-muted/30 backdrop-blur-sm border border-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground focus:bg-muted/50 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="container mx-auto px-4 pb-16">
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted/30 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4 text-lg">
                {searchQuery ? `No products found for "${searchQuery}"` : "No products found"}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategories([]);
                  setSelectedCollections([]);
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {filteredProducts.map((product) => (
                <FloatingProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Remove the FilterContent component as it's no longer needed