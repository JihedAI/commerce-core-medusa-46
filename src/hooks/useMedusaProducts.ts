import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";
import { HttpTypes } from "@medusajs/types";

interface MedusaProductsFilters {
  regionId?: string;
  search?: string;
  sortBy?: string;
  collections?: string[];
  categories?: string[];
  brands?: string[];
  tags?: string[];
  categoryId?: string;
}

interface MedusaProductsOptions {
  page: number;
  limit?: number;
  filters?: MedusaProductsFilters;
}

export function useMedusaProducts({ page, limit = 12, filters = {} }: MedusaProductsOptions) {
  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: [
      "medusa-products",
      page,
      limit,
      offset,
      filters.regionId,
      filters.search,
      filters.sortBy,
      filters.collections,
      filters.categories,
      filters.brands,
      filters.tags,
      filters.categoryId,
    ],
    queryFn: async () => {
      if (!filters.regionId) {
        return { products: [], count: 0 };
      }

      try {
        const order = getSortOrder(filters.sortBy);
        const result = await sdk.store.product.list({
          limit,
          offset,
          fields: "id,title,handle,thumbnail,*variants,*variants.calculated_price",
          region_id: filters.regionId,
          q: filters.search || undefined,
          collection_id: filters.collections?.length ? filters.collections : undefined,
          category_id: filters.categories?.length ? filters.categories : undefined,
          type_id: filters.brands?.length ? filters.brands : undefined,
          tag_id: filters.tags?.length ? filters.tags : undefined,
          ...(order ? { order } : {}),
        });

        // Client-side price sorting when API doesn't support calculated price ordering
        let products = result.products || [];
        if (filters.sortBy === "price-low" || filters.sortBy === "price-high") {
          const getPrice = (p: any) => {
            const variants = Array.isArray(p.variants) ? p.variants : [];
            if (variants.length === 0) return Number.POSITIVE_INFINITY;
            let minPrice = Number.POSITIVE_INFINITY;
            for (const v of variants) {
              const cp = v?.calculated_price as any;
              const candidate =
                (cp?.calculated_amount_with_tax as number | undefined) ??
                (cp?.calculated_amount as number | undefined) ??
                (Array.isArray(v?.prices) && v.prices[0]?.amount) ??
                Number.POSITIVE_INFINITY;
              if (typeof candidate === "number" && candidate < minPrice) {
                minPrice = candidate;
              }
            }
            return minPrice;
          };
          products = [...products].sort((a, b) => {
            const pa = getPrice(a);
            const pb = getPrice(b);
            if (pa === pb) {
              // tiebreaker by title for stable UI
              const ta = (a.title || "").localeCompare(b.title || "");
              return ta;
            }
            return filters.sortBy === "price-low" ? pa - pb : pb - pa;
          });
        }

        return {
          products,
          count: result.count || 0,
          hasMorePages: (result.count || 0) > limit * page,
        };
      } catch (error) {
        console.error("Failed to fetch products:", error);
        return { products: [], count: 0, hasMorePages: false };
      }
    },
    enabled: !!filters.regionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
}

function getSortOrder(sortBy?: string): string | undefined {
  switch (sortBy) {
    // Price sorting is handled client-side
    case "price-low":
    case "price-high":
      return undefined;
    case "title":
      return "title";
    case "-title":
      return "-title";
    case "created_at":
      return "created_at";
    default:
      return "-created_at";
  }
}

export default useMedusaProducts;
