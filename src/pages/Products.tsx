import React, { useState, useEffect, useMemo, useCallback, Suspense, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, ListFilter, ArrowUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";
import Layout from "@/components/Layout";
import { useRegion } from "@/contexts/RegionContext";
// Simple debounce utility
const debounce = <T extends (...args: any[]) => any,>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
import ProductCardOptimized from "@/components/ProductCardOptimized";
import ProductSkeleton from "@/components/ProductSkeleton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { scrollToProductsGrid, scrollToTop } from "@/utils/smoothScroll";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { SEO } from "@/components/SEO";
import { useMedusaProducts } from "@/hooks/useMedusaProducts";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

// Optimized filter state management
interface FilterState {
  search: string;
  sortBy: string;
  collections: string[];
  categories: string[];
  brands: string[];
  tags: string[];
}

// Helper to chunk an array into rows of a given size
function chunkIntoRows<T>(items: T[], rowSize: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += rowSize) {
    rows.push(items.slice(i, i + rowSize));
  }
  return rows;
}

// Memoized filter section component (non-collapsible, chip style)
const FilterSection = memo(({
  title,
  items,
  selected,
  onToggle,
  maxItems = 12
}: {
  title: string;
  items: any[];
  selected: string[];
  onToggle: (id: string) => void;
  maxItems?: number;
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayItems = useMemo(() => {
    const limited = items.slice(0, showAll ? items.length : maxItems);
    return limited.map(item => ({
      id: item.id,
      label: item.title || item.name || item.value || item.label
    }));
  }, [items, showAll, maxItems]);
  return <div className="space-y-2">
      <div className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{title}</div>
      <div className="flex flex-wrap gap-2">
        {displayItems.map(item => <label key={item.id} className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border ${selected.includes(item.id) ? 'border-foreground bg-accent/50' : 'border-border/60 bg-card/40'} hover:bg-accent cursor-pointer`}> 
            <input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggle(item.id)} className="h-3 w-3 rounded border-border" />
            <span className="text-xs whitespace-nowrap">{item.label}</span>
          </label>)}
        {items.length > maxItems && <button onClick={() => setShowAll(!showAll)} className="text-xs text-muted-foreground px-2 py-1 hover:text-foreground">
            {showAll ? 'Show Less' : `Show All (${items.length})`}
          </button>}
      </div>
    </div>;
});

// Optimized sort component
const SortSelect = memo(({
  value,
  onChange,
  t
}: {
  value: string;
  onChange: (value: string) => void;
  t: any;
}) => <select value={value} onChange={e => onChange(e.target.value)} className="w-full p-2 border border-border rounded-md bg-background text-sm">
    <option value="created_at">{t('sort.newest')}</option>
    <option value="price-low">{t('sort.priceLow')}</option>
    <option value="price-high">{t('sort.priceHigh')}</option>
    <option value="title">{t('sort.nameAZ')}</option>
    <option value="-title">{t('sort.nameZA')}</option>
  </select>);

// Lazy load heavy filter components
const LazyFilterSidebar = React.lazy(() => import("@/components/filters/FilterSidebar").then(module => ({
  default: module.FilterSidebar
})));
const LazyFilterDrawer = React.lazy(() => import("@/components/filters/FilterDrawer").then(module => ({
  default: module.FilterDrawer
})));

// Main optimized Products component
function ProductsOptimized() {
  const {
    t
  } = useTranslation();
  const {
    handle: categoryHandle
  } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    currentRegion
  } = useRegion();
  const {
    preloadImages
  } = useImagePreloader();

  // Optimized state management
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    sortBy: "created_at",
    collections: [],
    categories: [],
    brands: [],
    tags: []
  });

  // Debounced search
  const debouncedSetSearch = useCallback(debounce((value: string) => setDebouncedSearch(value), 300), []);
  useEffect(() => {
    debouncedSetSearch(searchQuery);
  }, [searchQuery, debouncedSetSearch]);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 12;

  // Fetch category data
  const {
    data: categoryData
  } = useQuery({
    queryKey: ["category-by-handle", categoryHandle],
    queryFn: async () => {
      if (!categoryHandle) return null;
      try {
        const {
          product_categories
        } = await sdk.store.category.list({
          fields: "id,name,handle",
          handle: categoryHandle
        });
        return product_categories?.[0] || null;
      } catch (error) {
        console.error("Failed to fetch category:", error);
        return null;
      }
    },
    enabled: !!categoryHandle,
    staleTime: 5 * 60 * 1000
  });

  // Use proper Medusa SDK method with limit and offset
  const {
    data: productsData,
    isLoading
  } = useMedusaProducts({
    page,
    limit,
    filters: {
      regionId: currentRegion?.id,
      search: debouncedSearch,
      sortBy: filters.sortBy,
      collections: filters.collections.length > 0 ? filters.collections : undefined,
      categories: filters.categories.length > 0 ? filters.categories : undefined,
      brands: filters.brands.length > 0 ? filters.brands : undefined,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
      categoryId: categoryData?.id
    }
  });

  // Fetch filter data with aggressive caching
  const {
    data: collectionsData
  } = useQuery({
    queryKey: ["collections-optimized"],
    queryFn: async () => {
      const {
        collections
      } = await sdk.store.collection.list({
        limit: 50,
        fields: "id,title,handle"
      });
      return collections || [];
    },
    staleTime: 10 * 60 * 1000,
    // 10 minutes
    refetchOnWindowFocus: false
  });
  const {
    data: categoriesData
  } = useQuery({
    queryKey: ["categories-optimized"],
    queryFn: async () => {
      const {
        product_categories
      } = await sdk.store.category.list({
        limit: 50,
        fields: "id,name,handle"
      });
      return product_categories || [];
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  });
  const {
    data: facetsData
  } = useQuery({
    queryKey: ["facets-optimized", currentRegion?.id],
    queryFn: async () => {
      if (!currentRegion?.id) return {
        brands: [],
        tags: []
      };
      try {
        const {
          products
        } = await sdk.store.product.list({
          limit: 100,
          fields: "id,*type,*tags",
          region_id: currentRegion.id
        });
        const brands: Array<{
          id: string;
          value: string;
        }> = [];
        const tags: Array<{
          id: string;
          value: string;
        }> = [];
        const brandSet = new Set<string>();
        const tagSet = new Set<string>();
        products.forEach((product: any) => {
          if (product.type) {
            const typeId = product.type.id || product.type.value || product.type;
            const typeValue = product.type.value || product.type.id || product.type;
            if (typeId && !brandSet.has(typeId)) {
              brandSet.add(typeId);
              brands.push({
                id: typeId,
                value: typeValue
              });
            }
          }
          if (product.tags) {
            const tagArray = Array.isArray(product.tags) ? product.tags : [product.tags];
            tagArray.forEach((tag: any) => {
              const tagId = tag.id || tag.value || tag;
              const tagValue = tag.value || tag.id || tag;
              if (tagId && !tagSet.has(tagId)) {
                tagSet.add(tagId);
                tags.push({
                  id: tagId,
                  value: tagValue
                });
              }
            });
          }
        });
        return {
          brands,
          tags
        };
      } catch (error) {
        console.error("Failed to fetch facets:", error);
        return {
          brands: [],
          tags: []
        };
      }
    },
    enabled: !!currentRegion?.id,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  });
  const products = productsData?.products || [];
  const totalPages = Math.ceil((productsData?.count || 0) / limit);
  const hasMorePages = productsData?.hasMorePages || false;

  // Progressive item rendering on a single responsive grid
  const [visibleCount, setVisibleCount] = useState(12);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  // Reset visible items when product set changes (new page/filters)
  useEffect(() => {
    setVisibleCount(Math.min(12, products.length));
  }, [products.length]);

  // Intersection observer to reveal more items when scrolling
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (visibleCount >= products.length) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + 12, products.length));
        }
      });
    }, {
      root: null,
      rootMargin: "200px 0px",
      // start loading a bit before viewport
      threshold: 0.01
    });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [products.length, visibleCount]);

  // Optimized filter handlers
  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 250);
  }, []);
  const toggleFilter = useCallback((type: 'collections' | 'categories' | 'brands' | 'tags', id: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(id) ? prev[type].filter(item => item !== id) : [...prev[type], id]
    }));
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 250);
    // Smooth scroll to products when filter changes
    setTimeout(() => scrollToProductsGrid(), 200);
  }, []);
  const clearAllFilters = useCallback(() => {
    setFilters({
      search: "",
      sortBy: "created_at",
      collections: [],
      categories: [],
      brands: [],
      tags: []
    });
    setSearchQuery("");
    // Smooth scroll to top when clearing filters
    setTimeout(() => scrollToTop(), 100);
  }, []);

  // Smooth scroll to products when page changes
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      setTimeout(() => scrollToProductsGrid(), 100);
    }
  }, [page, isLoading, products.length]);

  // Preload images for better performance
  useEffect(() => {
    if (products.length > 0 && !isLoading) {
      const imageUrls = products.map((product: any) => product.thumbnail || product.images?.[0]?.url).filter(Boolean);
      if (imageUrls.length > 0) {
        // Preload images in the background
        preloadImages(imageUrls, {
          quality: 85,
          width: 400
        });
      }
    }
  }, [products, isLoading, preloadImages]);

  // Memoized filter counts
  const activeFiltersCount = useMemo(() => {
    return filters.collections.length + filters.categories.length + filters.brands.length + filters.tags.length;
  }, [filters]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Rotating placeholder samples (reuse from header style)
  const exampleSearches = useMemo(() => ["Ray-Ban", "Oakley Holbrook", "Persol", "Gucci", "Prada Linea", "Carrera", "Maui Jim", "Tom Ford", "Versace", "Dior"], []);
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % exampleSearches.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [exampleSearches.length]);
  
  // SEO data
  const pageTitle = categoryData 
    ? `${categoryData.name} - Designer Eyewear Collection`
    : "All Products - Premium Sunglasses & Eyewear";
  const pageDescription = categoryData
    ? `Shop ${categoryData.name} from top brands. ${productsData?.count || 0} products with free shipping.`
    : `Browse our complete collection of premium eyewear. ${productsData?.count || 0} designer sunglasses and optical frames with free shipping.`;
  
  return <Layout>
      <SEO
        title={pageTitle}
        description={pageDescription}
        url={`https://lunette.amine.agency/products${categoryData ? `/${categoryData.handle}` : ''}`}
        type="website"
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        {categoryData && <div className="container mx-auto px-4 pt-8 pb-4">
            <h1 className="text-3xl font-bold text-center">{categoryData.name}</h1>
          </div>}
        
        <div className="container mx-auto px-4">
          {/* Mobile Search and Filter (replaced by top filter panel) */}
          <div className="hidden" />

          <div className="space-y-8">
            {/* Removed always-visible filters panel (now icon-triggered only) */}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Global centered search */}
              <div className="mb-6 flex justify-center px-2">
                <div className="relative w-full max-w-2xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="text" className="pl-11 pr-4 h-11 rounded-full shadow-sm border border-border/60 bg-background/70 focus-visible:ring-0 placeholder-transparent" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  {!searchQuery && <div className="pointer-events-none absolute left-11 right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <div className="relative h-[1.3em] overflow-hidden">
                        <AnimatePresence mode="wait">
                          <motion.span key={placeholderIndex} initial={{
                        y: '100%',
                        opacity: 0
                      }} animate={{
                        y: '0%',
                        opacity: 1
                      }} exit={{
                        y: '-100%',
                        opacity: 0
                      }} transition={{
                        duration: 0.5,
                        ease: 'easeInOut'
                      }} className="block whitespace-nowrap text-sm">
                            {t('search.search')}: {exampleSearches[placeholderIndex]}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </div>}
                </div>
              </div>

              {/* Results Header with icons */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl md:text-2xl font-semibold">
                    {categoryData ? categoryData.name : t('products.allProducts')}
                  </h2>
                  {/* Sort dropdown icon */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 hover:bg-accent text-foreground">
                        <ArrowUpDown className="h-4 w-4" />
                        <span className="sr-only">Sort</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => updateFilter('sortBy', 'created_at')}>{t('sort.newest')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateFilter('sortBy', 'price-low')}>{t('sort.priceLow')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateFilter('sortBy', 'price-high')}>{t('sort.priceHigh')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateFilter('sortBy', 'title')}>{t('sort.nameAZ')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateFilter('sortBy', '-title')}>{t('sort.nameZA')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground hidden sm:block">
                    {isLoading ? <>
                        <LoadingSpinner size="sm" />
                        {t('products.loading')}
                      </> : t('products.page', {
                    current: page,
                    total: totalPages,
                    count: products.length
                  })}
                  </div>
                  {/* Filter panel icon */}
                  <button onClick={() => setIsFilterOpen(v => !v)} className="inline-flex h-9 px-3 items-center gap-2 rounded-full border border-border/60 hover:bg-accent text-foreground">
                    <ListFilter className="h-4 w-4" />
                    <span className="text-sm hidden sm:inline">{t('filters.filters')}</span>
                    {activeFiltersCount > 0 && <span className="ml-1 text-xs text-muted-foreground">({activeFiltersCount})</span>}
                  </button>
                </div>
              </div>

              {/* Inline filter bar expanded in-place under header */}
              {isFilterOpen && <div className="mb-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {collectionsData && collectionsData.length > 0 && <FilterSection title={t('filters.collections')} items={collectionsData} selected={filters.collections} onToggle={id => toggleFilter('collections', id)} />}
                    {categoriesData && categoriesData.length > 0 && <FilterSection title={t('filters.categories')} items={categoriesData} selected={filters.categories} onToggle={id => toggleFilter('categories', id)} />}
                    {facetsData?.brands && facetsData.brands.length > 0 && <FilterSection title={t('filters.brands')} items={facetsData.brands} selected={filters.brands} onToggle={id => toggleFilter('brands', id)} />}
                    {facetsData?.tags && facetsData.tags.length > 0 && <FilterSection title={t('filters.tags')} items={facetsData.tags} selected={filters.tags} onToggle={id => toggleFilter('tags', id)} />}
                  </div>
                  {activeFiltersCount > 0 && <div className="mt-4 flex justify-end">
                      
                </div>}
                </div>}

              {/* Applied Filters Chips */}
              {activeFiltersCount > 0 && <div className="mb-4 flex flex-wrap gap-2">
                  {searchQuery && <Badge variant="secondary" className="flex items-center gap-1">
                      {t('search.search')}: "{searchQuery}"
                      <button onClick={() => setSearchQuery('')} className="ml-1 hover:bg-destructive/20 rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>}
                  {filters.collections.map(id => {
                const collection = collectionsData?.find(c => c.id === id);
                return collection ? <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {collection.title}
                        <button onClick={() => toggleFilter('collections', id)} className="ml-1 hover:bg-destructive/20 rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge> : null;
              })}
                  {filters.categories.map(id => {
                const category = categoriesData?.find(c => c.id === id);
                return category ? <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {category.name}
                        <button onClick={() => toggleFilter('categories', id)} className="ml-1 hover:bg-destructive/20 rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge> : null;
              })}
                  {filters.brands.map(id => {
                const brand = facetsData?.brands?.find(b => b.id === id);
                return brand ? <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {brand.value}
                        <button onClick={() => toggleFilter('brands', id)} className="ml-1 hover:bg-destructive/20 rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge> : null;
              })}
                  {filters.tags.map(id => {
                const tag = facetsData?.tags?.find(t => t.id === id);
                return tag ? <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {tag.value}
                        <button onClick={() => toggleFilter('tags', id)} className="ml-1 hover:bg-destructive/20 rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge> : null;
              })}
                  <Button variant="outline" size="sm" onClick={clearAllFilters} className="text-xs">
                    {t('buttons.clearAll')}
                  </Button>
              </div>}

              {/* Products Grid (progressive rows of 3) */}
              {isLoading ? <div className="space-y-4">
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="lg" text="Loading products..." />
              </div>
                  <ProductSkeleton count={12} />
                </div> : products.length === 0 ? <div className="text-center py-20">
                  <p className="text-muted-foreground mb-4 text-lg">
                    {searchQuery ? t('search.noResults', {
                  query: searchQuery
                }) : t('products.noProducts')}
                  </p>
                  <Button variant="outline" onClick={clearAllFilters}>
                    {t('filters.clearFilters')}
                  </Button>
                </div> : <>
                  <div data-products-grid className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-8">
                    {products.slice(0, visibleCount).map((product: any) => <div key={product.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <ProductCardOptimized product={product} />
                      </div>)}
                      </div>

                  {/* Sentinel to load more when visible */}
                  {visibleCount < products.length && <div ref={sentinelRef} className="h-10" />}
                  
                  {/* Pagination */}
                  {totalPages > 1 && <div className="mt-12 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          {page > 1 && <PaginationItem>
                              <PaginationPrevious href={`/products?${new URLSearchParams({
                        ...Object.fromEntries(searchParams),
                        page: (page - 1).toString()
                      })}`} onClick={() => setTimeout(() => scrollToProductsGrid(), 100)} />
                            </PaginationItem>}
                          
                          {Array.from({
                      length: Math.min(5, totalPages)
                    }, (_, i) => {
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
                      return <PaginationItem key={pageNumber}>
                                <PaginationLink href={`/products?${new URLSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: pageNumber.toString()
                        })}`} isActive={pageNumber === page} onClick={() => setTimeout(() => scrollToProductsGrid(), 100)}>
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>;
                    })}
                          
                          {page < totalPages && <PaginationItem>
                              <PaginationNext href={`/products?${new URLSearchParams({
                        ...Object.fromEntries(searchParams),
                        page: (page + 1).toString()
                      })}`} onClick={() => setTimeout(() => scrollToProductsGrid(), 100)} />
                            </PaginationItem>}
                        </PaginationContent>
                      </Pagination>
                    </div>}
                </>}
            </div>
          </div>
        </div>
      </div>
    </Layout>;
}
export default ProductsOptimized;