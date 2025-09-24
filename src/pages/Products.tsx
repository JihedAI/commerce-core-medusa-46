import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";
import useCollections from "@/hooks/useCollections";
import useCategories from "@/hooks/useCategories";
import ProductCard from "@/components/ProductCard";
import Layout from "@/components/Layout";
import { useRegion } from "@/contexts/RegionContext";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  const productGridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  

  const page = parseInt(searchParams.get("page") || "1");
  const limit = 12; // 3 products per row × 4 rows = 12 products per page

  // Fetch category by handle if categoryHandle is provided
  // Use cached categories when possible to resolve handle -> id
  const { data: categoriesCache = { flat: [] } } = useCategories({ fields: "id,name,handle,parent_category_id", limit: 100 });
  const cachedFlat = categoriesCache.flat || [];

  const { data: categoryData } = useQuery({
    queryKey: ["category-by-handle", categoryHandle],
    queryFn: async () => {
      if (!categoryHandle) return null;

      // Try cached flat list first
      const found = cachedFlat.find((c: any) => c.handle === categoryHandle);
      if (found) return found;

      try {
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

      // Only apply server-side sorting for simple fields
      switch (sortBy) {
        case "oldest":
          params.order = "created_at";
          break;
        case "a-z":
          params.order = "title";
          break;
        case "z-a":
          params.order = "-title";
          break;
        case "newest":
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
        console.log("🏷️ Filtering with tag IDs:", selectedTags);
        console.log("🏷️ Available tags data:", tagsData);
        
        // Use tag IDs directly for filtering
        params.tag_id = selectedTags;
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

  // Fetch categories for filters using shared hook
  const { data: categoriesDataRaw = { flat: [] } } = useCategories({ limit: 100, fields: "id,name,handle" });
  const categoriesData = categoriesDataRaw.flat || [];

  // Fetch collections for filters using shared hook
  const { data: collectionsData = [] } = useCollections({ limit: 100, fields: "id,title,handle" });

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
        
        const tagsSet = new Set();
        const tagsArray: Array<{id: string, value: string}> = [];
        
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
                let tagId = '';
                let tagValue = '';
                
                if (typeof tag === 'string') {
                  tagId = tag;
                  tagValue = tag;
                } else if (tag?.id && tag?.value) {
                  tagId = tag.id;
                  tagValue = tag.value;
                } else if (tag?.value) {
                  tagId = tag.value;
                  tagValue = tag.value;
                }
                
                if (tagId && tagValue && !tagsSet.has(tagId)) {
                  tagsSet.add(tagId);
                  tagsArray.push({
                    id: tagId,
                    value: tagValue
                  });
                }
              });
            } else if (typeof product.tags === 'string') {
              if (!tagsSet.has(product.tags)) {
                tagsSet.add(product.tags);
                tagsArray.push({
                  id: product.tags,
                  value: product.tags
                });
              }
            }
          }
        });
        
        console.log("🏷️ Final extracted tags:", tagsArray);
        return tagsArray;
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

  // Filter and sort products based on search query and sort option
  const filteredProducts = useMemo(() => {
    if (!productsData?.products) return [];
    
    let products = productsData.products.filter(product =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply client-side sorting for price-based sorting
    if (sortBy === "price-low" || sortBy === "price-high") {
      products = products.sort((a, b) => {
        const aPrice = a.variants?.[0]?.calculated_price?.calculated_amount || 0;
        const bPrice = b.variants?.[0]?.calculated_price?.calculated_amount || 0;
        return sortBy === "price-low" ? aPrice - bPrice : bPrice - aPrice;
      });
    }
    
    return products;
  }, [productsData?.products, searchQuery, sortBy]);

  const totalPages = Math.ceil((productsData?.count || 0) / limit);

  // GSAP animations
  useEffect(() => {
    if (!productsLoading && filteredProducts.length > 0 && productGridRef.current) {
      const productCards = productGridRef.current.querySelectorAll('.product-card');
      
      // Reset opacity for new products
      gsap.set(productCards, { opacity: 0, y: 30 });
      
      // Animate products in with stagger
      gsap.to(productCards, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1,
        delay: 0.2
      });
    }
  }, [productsLoading, filteredProducts]);

  // Animate header on mount
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current.children, 
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: "power2.out",
          stagger: 0.1,
          delay: 0.1
        }
      );
    }
  }, [categoryData]);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Page Title - Show category name if viewing a specific category */}
        {categoryData && (
          <div ref={headerRef} className="container mx-auto px-4 pt-8 pb-4">
            <div className="text-center">
              <h1 className="text-3xl font-display font-bold mb-2">{categoryData.name}</h1>
              <p className="text-muted-foreground">Explore our {categoryData.name.toLowerCase()} collection</p>
            </div>
          </div>
        )}
        
        <div className="container mx-auto px-4">
          {/* Mobile Filter Button and Search */}
          <div className="lg:hidden mb-6">
            <div className="flex gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-shrink-0">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SheetHeader className="p-6 border-b">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="p-6 overflow-y-auto">
                    <FilterContent 
                      collectionsData={collectionsData}
                      selectedCollections={selectedCollections}
                      handleCollectionToggle={handleCollectionToggle}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      categoriesData={categoriesData}
                      selectedCategories={selectedCategories}
                      handleCategoryToggle={handleCategoryToggle}
                      brandsData={brandsData}
                      selectedBrands={selectedBrands}
                      handleBrandToggle={handleBrandToggle}
                      tagsData={tagsData}
                      selectedTags={selectedTags}
                      handleTagToggle={handleTagToggle}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop Sidebar Filter */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-6 text-foreground">Filters</h2>
                <FilterContent 
                  collectionsData={collectionsData}
                  selectedCollections={selectedCollections}
                  handleCollectionToggle={handleCollectionToggle}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  categoriesData={categoriesData}
                  selectedCategories={selectedCategories}
                  handleCategoryToggle={handleCategoryToggle}
                  brandsData={brandsData}
                  selectedBrands={selectedBrands}
                  handleBrandToggle={handleBrandToggle}
                  tagsData={tagsData}
                  selectedTags={selectedTags}
                  handleTagToggle={handleTagToggle}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Desktop Search Bar */}
              <div className="hidden lg:block mb-8">
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

              {/* Product Results Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold">
                    {categoryData ? categoryData.name : "All Products"}
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {productsLoading ? (
                      <span>Loading...</span>
                    ) : (
                      <span>
                        Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, productsData?.count || 0)} of {productsData?.count || 0} products
                        {searchQuery && ` matching "${searchQuery}"`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden sm:block text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
              </div>

              {/* Products Section */}
              {productsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="aspect-[4/5] bg-muted/30 rounded-2xl animate-pulse" />
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
                <>
                  <div ref={productGridRef} className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                    {filteredProducts.map((product, index) => (
                      <div 
                        key={product.id} 
                        className="product-card opacity-0"
                        style={{ '--stagger-delay': `${index * 0.1}s` } as React.CSSProperties}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          {page > 1 && (
                            <PaginationItem>
                              <PaginationPrevious 
                                href={`/products?${new URLSearchParams({
                                  ...Object.fromEntries(searchParams),
                                  page: (page - 1).toString()
                                })}`}
                              />
                            </PaginationItem>
                          )}
                          
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (page <= 3) {
                              pageNumber = i + 1;
                            } else if (page >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i;
                            } else {
                              pageNumber = page - 2 + i;
                            }
                            
                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  href={`/products?${new URLSearchParams({
                                    ...Object.fromEntries(searchParams),
                                    page: pageNumber.toString()
                                  })}`}
                                  isActive={pageNumber === page}
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          
                          {page < totalPages && (
                            <PaginationItem>
                              <PaginationNext 
                                href={`/products?${new URLSearchParams({
                                  ...Object.fromEntries(searchParams),
                                  page: (page + 1).toString()
                                })}`}
                              />
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Filter content component for reuse
function FilterContent({ 
  collectionsData, 
  selectedCollections, 
  handleCollectionToggle, 
  sortBy, 
  setSortBy, 
  categoriesData, 
  selectedCategories, 
  handleCategoryToggle, 
  brandsData, 
  selectedBrands, 
  handleBrandToggle, 
  tagsData, 
  selectedTags, 
  handleTagToggle 
}: any) {
  const [openSections, setOpenSections] = useState({
    collections: true,
    sort: true,
    categories: false,
    brands: false,
    tags: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-4">
      {/* Collections Quick Filter */}
      <Collapsible open={openSections.collections} onOpenChange={() => toggleSection('collections')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
          <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Collections</h3>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openSections.collections ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="flex flex-wrap gap-2">
            {collectionsData?.slice(0, 4).map((collection: any) => (
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
        </CollapsibleContent>
      </Collapsible>

      {/* Sort Options */}
      <Collapsible open={openSections.sort} onOpenChange={() => toggleSection('sort')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
          <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Sort By</h3>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openSections.sort ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
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
        </CollapsibleContent>
      </Collapsible>

      {/* Categories */}
      {categoriesData && categoriesData.length > 0 && (
        <Collapsible open={openSections.categories} onOpenChange={() => toggleSection('categories')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
            <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Categories</h3>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openSections.categories ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
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
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Brands */}
      {brandsData && brandsData.length > 0 && (
        <Collapsible open={openSections.brands} onOpenChange={() => toggleSection('brands')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
            <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Brands</h3>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openSections.brands ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
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
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Tags */}
      {tagsData && tagsData.length > 0 && (
        <Collapsible open={openSections.tags} onOpenChange={() => toggleSection('tags')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
            <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Tags</h3>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openSections.tags ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {tagsData.map((tag: any) => (
                <div key={tag.id} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={() => handleTagToggle(tag.id)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`tag-${tag.id}`} className="text-sm cursor-pointer group-hover:text-foreground transition-colors">
                    {tag.value}
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}