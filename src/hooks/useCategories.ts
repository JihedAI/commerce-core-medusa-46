import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";

export type UseCategoriesOptions = {
  limit?: number;
  fields?: string;
  includeDescendantsTree?: boolean;
  enabled?: boolean;
  params?: Record<string, any>;
};

const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes

function buildTree(flat: any[]) {
  const map = new Map<string, any>();
  flat.forEach((c) => map.set(c.id, { ...c, category_children: [] }));

  const roots: any[] = [];

  map.forEach((node) => {
    const parentId = node.parent_category_id;
    if (parentId && map.has(parentId)) {
      map.get(parentId).category_children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function useCategories(options: UseCategoriesOptions = {}) {
  const { limit = 100, fields = "id,name,handle,parent_category_id,description,category_children", includeDescendantsTree = false, enabled = true, params = {} } = options;

  return useQuery({
    queryKey: ["categories", { limit, fields, includeDescendantsTree, params }],
    queryFn: async () => {
      if (includeDescendantsTree) {
        const { product_categories } = await sdk.store.category.list({
          limit,
          fields,
          include_descendants_tree: true,
          parent_category_id: null,
          ...params,
        });

        // If the API returned a usable tree, use it
        if (product_categories && product_categories.length > 0) {
          const tree = product_categories;
          const flat = flattenTree(tree);
          return { flat, tree };
        }

        // Fallback: fetch full flat list and build a tree client-side
        const { product_categories: allCategories } = await sdk.store.category.list({
          limit: 100,
          fields: "id,name,handle,parent_category_id,description",
          ...params,
        });

        const flat = allCategories || [];
        const tree = buildTree(flat);
        return { flat, tree };
      }

      const { product_categories } = await sdk.store.category.list({ limit, fields, ...params });
      const flat = product_categories || [];
      const tree = buildTree(flat);
      return { flat, tree };
    },
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
    enabled,
  });
}

function flattenTree(tree: any[]): any[] {
  const out: any[] = [];
  const stack = [...tree];
  while (stack.length) {
    const node = stack.shift();
    const copy = { ...node };
    const children = copy.category_children || [];
    copy.category_children = undefined;
    out.push(copy);
    if (children && children.length) {
      stack.push(...children);
    }
  }
  return out;
}

export default useCategories;
