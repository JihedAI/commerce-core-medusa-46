import React, { memo, useMemo, useState } from "react";
import { FilterSection } from "./FilterSection";
import { FilterCheckboxList } from "./FilterCheckboxList";
import { FilterRadioList } from "./FilterRadioList";

type ListItem = { id: string; name?: string; title?: string; value?: string };

type Props = {
  collections: ListItem[];
  categories: ListItem[];
  brands: Array<{ id: string; value: string }>;
  tags: Array<{ id: string; value: string }>;
  selectedCollections: string[];
  selectedCategories: string[];
  selectedBrands: string[];
  selectedTags: string[];
  onToggleCollection: (id: string) => void;
  onToggleCategory: (id: string) => void;
  onToggleBrand: (id: string) => void;
  onToggleTag: (id: string) => void;
  sortBy: string;
  setSortBy: (v: any) => void;
};

function FilterSidebarBase({ collections, categories, brands, tags, selectedCollections, selectedCategories, selectedBrands, selectedTags, onToggleCollection, onToggleCategory, onToggleBrand, onToggleTag, sortBy, setSortBy }: Props) {
  const [open, setOpen] = useState({ collections: true, sort: true, categories: false, brands: false, tags: false });

  const collectionItems = useMemo(() => (collections || []).slice(0, 8).map((c) => ({ id: c.id as string, label: (c.title || c.name || "") as string })), [collections]);
  const categoryItems = useMemo(() => (categories || []).map((c) => ({ id: c.id as string, label: (c.name || c.title || "") as string })), [categories]);
  const brandItems = useMemo(() => (brands || []).map((b) => ({ id: b.id, label: b.value })), [brands]);
  const tagItems = useMemo(() => (tags || []).map((t) => ({ id: t.id, label: t.value })), [tags]);

  return (
    <div className="space-y-4">
      <FilterSection title="Collections" open={open.collections} onOpenChange={() => setOpen((s) => ({ ...s, collections: !s.collections }))}>
        <div className="flex flex-wrap gap-2">
          {collectionItems.map((c) => (
            <button key={c.id} onClick={() => onToggleCollection(c.id)} className={`px-3 py-1.5 text-xs rounded-md border transition-all duration-200 ${selectedCollections.includes(c.id) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted border-border'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Sort By" open={open.sort} onOpenChange={() => setOpen((s) => ({ ...s, sort: !s.sort }))}>
        <FilterRadioList
          name="sort"
          value={sortBy}
          onChange={(v) => setSortBy(v)}
          items={[
            { value: "newest", label: "Newest" },
            { value: "price-low", label: "Price: Low to High" },
            { value: "price-high", label: "Price: High to Low" },
            { value: "a-z", label: "A–Z" },
          ]}
        />
      </FilterSection>

      {categoryItems.length > 0 && (
        <FilterSection title="Categories" open={open.categories} onOpenChange={() => setOpen((s) => ({ ...s, categories: !s.categories }))}>
          <FilterCheckboxList items={categoryItems} selected={selectedCategories} onToggle={onToggleCategory} idPrefix="cat" />
        </FilterSection>
      )}

      {brandItems.length > 0 && (
        <FilterSection title="Brands" open={open.brands} onOpenChange={() => setOpen((s) => ({ ...s, brands: !s.brands }))}>
          <FilterCheckboxList items={brandItems} selected={selectedBrands} onToggle={onToggleBrand} idPrefix="brand" />
        </FilterSection>
      )}

      {tagItems.length > 0 && (
        <FilterSection title="Tags" open={open.tags} onOpenChange={() => setOpen((s) => ({ ...s, tags: !s.tags }))}>
          <FilterCheckboxList items={tagItems} selected={selectedTags} onToggle={onToggleTag} idPrefix="tag" />
        </FilterSection>
      )}
    </div>
  );
}

export const FilterSidebar = memo(FilterSidebarBase);


