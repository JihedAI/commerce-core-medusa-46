import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "react-router-dom";

type SelectedFilters = {
  categories: string[];
  collections: string[];
  brands: string[];
  tags: string[];
};

export type SortOption = "newest" | "oldest" | "a-z" | "z-a" | "price-low" | "price-high";

export type UseProductFiltersResult = {
  search: string;
  setSearch: (v: string) => void;
  debouncedSearch: string;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  selected: SelectedFilters;
  toggleCategory: (id: string) => void;
  toggleCollection: (id: string) => void;
  toggleBrand: (id: string) => void;
  toggleTag: (id: string) => void;
  clearAll: () => void;
  serializedKey: string;
};

function parseMulti(param: string | null): string[] {
  if (!param) return [];
  try {
    // support csv or repeated params encoded as csv
    return param.split(",").filter(Boolean);
  } catch {
    return [];
  }
}

function toggleInArray(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function useProductFilters(): UseProductFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // hydrate from URL
  const initialSearch = searchParams.get("q") || "";
  const initialSort = (searchParams.get("sort") as SortOption) || "newest";
  const initialSelected: SelectedFilters = {
    categories: parseMulti(searchParams.get("cat")),
    collections: parseMulti(searchParams.get("col")),
    brands: parseMulti(searchParams.get("brand")),
    tags: parseMulti(searchParams.get("tag")),
  };

  const [search, setSearch] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [selected, setSelected] = useState<SelectedFilters>(initialSelected);

  // debounce search
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialSearch);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // write to URL when state changes
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) next.set("q", debouncedSearch); else next.delete("q");
    next.set("sort", sortBy);
    const write = (key: string, arr: string[]) => {
      if (arr.length) next.set(key, [...arr].sort().join(",")); else next.delete(key);
    };
    write("cat", selected.categories);
    write("col", selected.collections);
    write("brand", selected.brands);
    write("tag", selected.tags);
    // keep existing page param if present; page logic handled by caller
    setSearchParams(next, { replace: true });
  }, [debouncedSearch, sortBy, selected, setSearchParams]);

  const toggleCategory = useCallback((id: string) => {
    startTransition(() => setSelected((s) => ({ ...s, categories: toggleInArray(s.categories, id) })));
  }, []);

  const toggleCollection = useCallback((id: string) => {
    startTransition(() => setSelected((s) => ({ ...s, collections: toggleInArray(s.collections, id) })));
  }, []);

  const toggleBrand = useCallback((id: string) => {
    startTransition(() => setSelected((s) => ({ ...s, brands: toggleInArray(s.brands, id) })));
  }, []);

  const toggleTag = useCallback((id: string) => {
    startTransition(() => setSelected((s) => ({ ...s, tags: toggleInArray(s.tags, id) })));
  }, []);

  const clearAll = useCallback(() => {
    startTransition(() => {
      setSelected({ categories: [], collections: [], brands: [], tags: [] });
      setSearch("");
      setSortBy("newest");
    });
  }, []);

  // stable serialized key for react-query
  const serializedKey = useMemo(() => {
    const stable = {
      q: debouncedSearch,
      sort: sortBy,
      cat: [...selected.categories].sort(),
      col: [...selected.collections].sort(),
      brand: [...selected.brands].sort(),
      tag: [...selected.tags].sort(),
    };
    return JSON.stringify(stable);
  }, [debouncedSearch, sortBy, selected]);

  return {
    search,
    setSearch,
    debouncedSearch,
    sortBy,
    setSortBy,
    selected,
    toggleCategory,
    toggleCollection,
    toggleBrand,
    toggleTag,
    clearAll,
    serializedKey,
  };
}

export default useProductFilters;


