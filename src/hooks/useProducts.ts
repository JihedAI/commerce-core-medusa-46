import { useQuery, useQueryClient } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";
import { useMemo } from "react";

export type ProductView = "list" | "detail" | "carousel" | "related" | "facets";

export type ProductFilters = {
  categoryId?: string;
  collectionId?: string | string[];
  tagId?: string | string[];
  typeId?: string | string[];
  handle?: string;
  search?: string;
  sortBy?: string;
  regionId?: string;
  limit?: number;
  offset?: number;
};

export type ProductQueryOptions = {
  view: ProductView;
  filters?: ProductFilters;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
};

// Field sets optimized for different use cases
const FIELD_SETS = {
  list: "id,title,handle,thumbnail,*variants,*variants.calculated_price",
  detail: "*variants.calculated_price,+variants.options,+images,+collection,+metadata,+weight,+length,+width,+height",
  carousel: "id,title,handle,thumbnail,*variants.calculated_price,*tags", // Minimal fields + tags for title
  related: "id,title,handle,thumbnail,*variants,*variants.calculated_price,*images,*collection",
  facets: "id,*type,*tags",
};

// Normalize product data for consistent caching
function normalizeProduct(product: any) {
  if (!product) return null;
  
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    thumbnail: product.thumbnail,
    images: product.images || [],
    variants: product.variants || [],
    collection: product.collection,
    categories: product.categories || [],
    tags: product.tags || [],
    type: product.type,
    metadata: product.metadata,
    weight: product.weight,
    length: product.length,
    width: product.width,
    height: product.height,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
}

// Build query parameters from filters
function buildQueryParams(filters: ProductFilters, view: ProductView) {
  const params: any = {
    fields: FIELD_SETS[view],
    limit: filters.limit || 12,
    offset: filters.offset || 0,
  };

  if (filters.regionId) params.region_id = filters.regionId;
  if (filters.categoryId) params.category_id = filters.categoryId;
  if (filters.collectionId) params.collection_id = Array.isArray(filters.collectionId) ? filters.collectionId : [filters.collectionId];
  if (filters.tagId) params.tag_id = Array.isArray(filters.tagId) ? filters.tagId : [filters.tagId];
  if (filters.typeId) params.type_id = Array.isArray(filters.typeId) ? filters.typeId : [filters.typeId];
  // Prefer exact handle match when provided
  if (filters.handle) params.handle = [filters.handle];
  if (filters.search) params.q = filters.search;

  // Apply sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "oldest": params.order = "created_at"; break;
      case "a-z": params.order = "title"; break;
      case "z-a": params.order = "-title"; break;
      case "price-low": params.order = "variants.calculated_price.calculated_amount"; break;
      case "price-high": params.order = "-variants.calculated_price.calculated_amount"; break;
      case "newest": default: params.order = "-created_at"; break;
    }
  }

  return params;
}

// Generate stable query key
function getQueryKey(view: ProductView, filters: ProductFilters = {}) {
  const stableFilters = {
    categoryId: filters.categoryId || null,
    collectionId: filters.collectionId ? (Array.isArray(filters.collectionId) ? [...filters.collectionId].sort() : filters.collectionId) : null,
    tagId: filters.tagId ? (Array.isArray(filters.tagId) ? [...filters.tagId].sort() : filters.tagId) : null,
    typeId: filters.typeId ? (Array.isArray(filters.typeId) ? [...filters.typeId].sort() : filters.typeId) : null,
    handle: filters.handle || null,
    search: filters.search || null,
    sortBy: filters.sortBy || "newest",
    regionId: filters.regionId || null,
    limit: filters.limit || 12,
    offset: filters.offset || 0,
  };
  
  return ["products", view, stableFilters];
}

export function useProducts(options: ProductQueryOptions) {
  const { view, filters = {}, enabled = true, staleTime = 5 * 60 * 1000, cacheTime = 30 * 60 * 1000 } = options;
  const queryClient = useQueryClient();
  
  const queryKey = useMemo(() => getQueryKey(view, filters), [view, filters]);
  const queryParams = useMemo(() => buildQueryParams(filters, view), [filters, view]);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const { products, count } = await sdk.store.product.list(queryParams);
      
      // Normalize products for consistent caching
      // For detail view, return full product objects to satisfy type expectations
      const rawProducts = products || [];
      const normalizedProducts = view === "detail"
        ? rawProducts
        : rawProducts.map(normalizeProduct).filter(Boolean);
      
      return {
        products: normalizedProducts,
        count: count || 0,
        hasMore: normalizedProducts.length === (filters.limit || 12),
      };
    },
    enabled,
    staleTime,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
}

// Specialized hooks for common use cases
export function useProductList(filters: ProductFilters, options?: Partial<ProductQueryOptions>) {
  return useProducts({
    view: "list",
    filters,
    ...options,
  });
}

export function useProductDetail(handle: string, regionId?: string, options?: Partial<ProductQueryOptions>) {
  // console.log("🔧 useProductDetail called:", { handle, regionId });
  
  return useProducts({
    view: "detail",
    filters: { handle, regionId, limit: 1 },
    ...options,
  });
}

export function useProductCarousel(tagId: string, regionId?: string, limit = 6, options?: Partial<ProductQueryOptions>) {
  return useProducts({
    view: "carousel",
    filters: { tagId, regionId, limit },
    ...options,
  });
}

export function useRelatedProducts(collectionId: string, regionId?: string, limit = 6, options?: Partial<ProductQueryOptions>) {
  return useProducts({
    view: "related",
    filters: { collectionId, regionId, limit },
    ...options,
  });
}

export function useProductFacets(regionId?: string, options?: Partial<ProductQueryOptions>) {
  return useProducts({
    view: "facets",
    filters: { regionId, limit: 200 },
    staleTime: 10 * 60 * 1000, // 10 minutes for facets
    ...options,
  });
}

// Prefetch utility for adjacent pages
export function useProductPrefetch() {
  const queryClient = useQueryClient();
  
  return (view: ProductView, filters: ProductFilters, pages: number[]) => {
    pages.forEach(page => {
      const pageFilters = { ...filters, offset: (page - 1) * (filters.limit || 12) };
      const queryKey = getQueryKey(view, pageFilters);
      
      queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
          const params = buildQueryParams(pageFilters, view);
          const { products, count } = await sdk.store.product.list(params);
          return {
            products: (products || []).map(normalizeProduct).filter(Boolean),
            count: count || 0,
            hasMore: (products || []).length === (filters.limit || 12),
          };
        },
        staleTime: 30 * 1000,
      });
    });
  };
}

export default useProducts;
