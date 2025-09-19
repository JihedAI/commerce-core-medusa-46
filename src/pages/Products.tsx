import React, { useState, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";
import FloatingProductCard from "@/components/FloatingProductCard";
import Layout from "@/components/Layout";
import { useRegion } from "@/contexts/RegionContext";

export default function Products() {
  const { handle: categoryHandle } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentRegion } = useRegion();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  

  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  // Fetch category by handle if categoryHandle is provided
  const { data: categoryData } = useQuery({
    queryKey: ["category-by-handle", categoryHandle],
    queryFn: async () => {
      if (!categoryHandle) return null;
      
      try {
        // First, find the category by handle
        const { product_categories } = await sdk.store.category.list({
          fields: "id,name,handle",
          handle: categoryHandle
        });
        
        return product_categories?.[0] || null;
      } catch (error) {
        console.error("Failed to fetch category by handle:", error);
        return null;
      }
    },
    enabled: !!categoryHandle,
  });

  // Fetch products using the new SDK
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products", categoryData?.id, sortBy, page, selectedCollections, selectedCategories, selectedBrands, selectedTags, currentRegion?.id],
    queryFn: async () => {
      if (!currentRegion) return { products: [], count: 0 };
      
      const params: any = {
        limit,
        offset: (page - 1) * limit,
        fields: "*variants,*variants.calculated_price,*images,*collection,*categories,*type,*tags"
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

      // Handle category filters - combine categoryData and selectedCategories
      const categoryIds = [];
      if (categoryData?.id) {
        categoryIds.push(categoryData.id);
      }
      if (selectedCategories.length > 0) {
        categoryIds.push(...selectedCategories);
      }
      if (categoryIds.length > 0) {
        params.category_id = categoryIds;
      }

      if (selectedCollections.length > 0) {
        params.collection_id = selectedCollections;
      }

      if (selectedBrands.length > 0) {
        params.type_id = selectedBrands;
      }

      if (selectedTags.length > 0) {
        console.log("🏷️ Filtering with tag values:", selectedTags);
        console.log("🏷️ Available tags data:", tagsData);
        
        // selectedTags already contains tag values, use them directly
        params.tags = selectedTags;
      }

      // Add region context for pricing
      if (currentRegion?.id) {
        params.region_id = currentRegion.id;
      }

      const { products, count } = await sdk.store.product.list(params);
      return { products: products || [], count: count || 0 };
    },
    enabled: !!currentRegion && (!categoryHandle || !!categoryData),
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

  // Fetch product types separately to get their values
  const { data: productTypesData } = useQuery({
    queryKey: ["product-types"],
    queryFn: async () => {
      try {
        console.log("🔍 Fetching product types...");
        
        // First try to fetch products with expanded type information
        const { products } = await sdk.store.product.list({
          limit: 100,
          fields: "id,title,*type"
        });
        
        console.log("📦 Sample products with types:", products?.slice(0, 3));
        
        if (!products || products.length === 0) {
          console.log("⚠️ No products found for types");
          return [];
        }
        
        const typesSet = new Set();
        const typesArray: Array<{id: string, value: string}> = [];
        
        products.forEach((product, index) => {
          if (index < 5) { // Log first 5 products for debugging
            console.log(`📦 Product ${index + 1} - ${product.title}:`, {
              type: product.type,
              allKeys: Object.keys(product)
            });
          }
          
          // Extract type information
          if (product.type) {
            let typeValue = '';
            let typeId = '';
            
            if (typeof product.type === 'string') {
              typeValue = product.type;
              typeId = product.type;
            } else if (product.type.value) {
              typeValue = product.type.value;
              typeId = product.type.id || product.type.value;
            } else if (product.type.id) {
              typeValue = product.type.id; // Fallback to ID if no value
              typeId = product.type.id;
            }
            
            if (typeValue && !typesSet.has(typeId)) {
              typesSet.add(typeId);
              typesArray.push({
                id: typeId,
                value: typeValue
              });
            }
          }
        });
        
        console.log("🏷️ Final extracted product types:", typesArray);
        return typesArray;
      } catch (error) {
        console.error("❌ Error fetching product types:", error);
        return [];
      }
    },
  });

  // Fetch product tags from products
  const { data: productTagsData } = useQuery({
    queryKey: ["product-tags"],
    queryFn: async () => {
      try {
        console.log("🔍 Fetching products for tag extraction...");
        
        // Fetch products with expanded type and tags information
        const { products } = await sdk.store.product.list({
          limit: 100,
          fields: "id,title,*type,*tags"
        });
        
        console.log("📦 Sample products for tag analysis:", products?.slice(0, 3));
        
        if (!products || products.length === 0) {
          console.log("⚠️ No products found for tags");
          return [];
        }
        
        const tagsSet = new Set<string>();
        
        products.forEach((product, index) => {
          if (index < 3) { // Log first 3 products for debugging
            console.log(`📦 Product ${index + 1} - ${product.title}:`, {
              type: product.type,
              tags: product.tags,
              allKeys: Object.keys(product)
            });
          }
          
          // Extract tags - handle both array and single structures
          if (product.tags) {
            if (Array.isArray(product.tags)) {
              product.tags.forEach(tag => {
                if (typeof tag === 'string') {
                  tagsSet.add(tag);
                } else if (tag?.value) {
                  tagsSet.add(tag.value);
                } else if (tag?.id) {
                  tagsSet.add(tag.id);
                }
              });
            } else if (typeof product.tags === 'string') {
              tagsSet.add(product.tags);
            }
          }
        });
        
        const tags = Array.from(tagsSet).map((tag, index) => ({
          id: `tag-${index}`,
          value: tag
        }));
        
        console.log("🏷️ Final extracted tags:", tags);
        return tags;
      } catch (error) {
        console.error("❌ Error fetching product tags:", error);
        return [];
      }
    },
  });

  // Use the separate data sources
  const brandsData = productTypesData || [];
  const tagsData = productTagsData || [];

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

  const handleBrandToggle = (brandId: string) => {
    console.log("🏷️ Toggling brand:", brandId, "Current brands:", selectedBrands);
    setSelectedBrands((prev) => {
      const newSelection = prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId];
      console.log("🏷️ New brand selection:", newSelection);
      return newSelection;
    });
  };

  const handleTagToggle = (tagId: string) => {
    console.log("🏷️ Toggling tag:", tagId, "Current tags:", selectedTags);
    setSelectedTags((prev) => {
      const newSelection = prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId];
      console.log("🏷️ New tag selection:", newSelection);
      return newSelection;
    });
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
        {/* Page Title - Show category name if viewing a specific category */}
        {categoryData && (
          <div className="container mx-auto px-4 pt-8 pb-4">
            <div className="text-center">
              <h1 className="text-3xl font-display font-bold mb-2">{categoryData.name}</h1>
              <p className="text-muted-foreground">Explore our {categoryData.name.toLowerCase()} collection</p>
            </div>
          </div>
        )}
        
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Left Sidebar Filter */}
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-6 text-foreground">Filters</h2>
                
                <div className="space-y-8">
                  {/* Collections Quick Filter */}
                  <div>
                    <h3 className="font-medium mb-4 text-sm uppercase tracking-wide text-muted-foreground">Collections</h3>
                    <div className="flex flex-wrap gap-2">
                      {collectionsData?.slice(0, 4).map((collection) => (
                        <button
                          key={collection.id}
                          onClick={() => handleCollectionToggle(collection.id)}
                          className={`px-3 py-1.5 text-xs rounded-md border transition-all duration-200 ${
                            selectedCollections.includes(collection.id)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:bg-muted border-border'
                          }`}
                        >
                          {collection.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <h3 className="font-medium mb-4 text-sm uppercase tracking-wide text-muted-foreground">Sort By</h3>
                    <div className="space-y-2">
                      {[
                        { value: "newest", label: "Newest" },
                        { value: "price-low", label: "Price: Low to High" },
                        { value: "price-high", label: "Price: High to Low" },
                        { value: "a-z", label: "A–Z" },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="sort"
                            value={option.value}
                            checked={sortBy === option.value}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-3.5 h-3.5 text-primary border-border"
                          />
                          <span className="text-sm group-hover:text-foreground transition-colors">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Categories */}
                  {categoriesData && categoriesData.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-4 text-sm uppercase tracking-wide text-muted-foreground">Categories</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {categoriesData.map((category: any) => (
                          <div key={category.id} className="flex items-center space-x-3 group">
                            <Checkbox
                              id={category.id}
                              checked={selectedCategories.includes(category.id)}
                              onCheckedChange={() => handleCategoryToggle(category.id)}
                              className="w-4 h-4"
                            />
                            <Label htmlFor={category.id} className="text-sm cursor-pointer group-hover:text-foreground transition-colors">
                              {category.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Brands (Product Types) */}
                  {brandsData && brandsData.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-4 text-sm uppercase tracking-wide text-muted-foreground">Brands</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {brandsData.map((brand: any) => (
                          <div key={brand.id} className="flex items-center space-x-3 group">
                            <Checkbox
                              id={`brand-${brand.id}`}
                              checked={selectedBrands.includes(brand.id)}
                              onCheckedChange={() => handleBrandToggle(brand.id)}
                              className="w-4 h-4"
                            />
                            <Label htmlFor={`brand-${brand.id}`} className="text-sm cursor-pointer group-hover:text-foreground transition-colors">
                              {brand.value}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {tagsData && tagsData.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-4 text-sm uppercase tracking-wide text-muted-foreground">Tags</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {tagsData.map((tag: any) => (
                          <div key={tag.id} className="flex items-center space-x-3 group">
                            <Checkbox
                              id={`tag-${tag.id}`}
                              checked={selectedTags.includes(tag.value)}
                              onCheckedChange={() => handleTagToggle(tag.value)}
                              className="w-4 h-4"
                            />
                            <Label htmlFor={`tag-${tag.id}`} className="text-sm cursor-pointer group-hover:text-foreground transition-colors">
                              {tag.value}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-colors"
                  />
                </div>
              </div>

              {/* Products Section */}
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
                      setSelectedBrands([]);
                      setSelectedTags([]);
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
        </div>
      </div>
    </Layout>
  );
}

// Remove the FilterContent component as it's no longer needed