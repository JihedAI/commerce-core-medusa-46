import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";

export type UseCollectionsOptions = {
  limit?: number;
  fields?: string;
  params?: Record<string, any>;
  enabled?: boolean;
};

const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_CACHE_TIME = 30 * 60 * 1000; // 30 minutes

export function useCollections(options: UseCollectionsOptions = {}) {
  const { limit = 100, fields = "id,title,handle,metadata", params = {}, enabled = true } = options;

  return useQuery({
    queryKey: ["collections", { limit, fields, params }],
    queryFn: async () => {
      const res = await sdk.store.collection.list({ limit, fields, ...params });
      return res.collections || [];
    },
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
    enabled,
  });
}

export default useCollections;
