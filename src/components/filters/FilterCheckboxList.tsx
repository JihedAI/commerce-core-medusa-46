import React, { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export type CheckboxItem = { id: string; label: string };

type Props = {
  items: CheckboxItem[];
  selected: string[];
  onToggle: (id: string) => void;
  maxHeightClass?: string;
  idPrefix?: string;
};

function FilterCheckboxListBase({ items, selected, onToggle, maxHeightClass = "max-h-40", idPrefix = "item" }: Props) {
  return (
    <div className={`space-y-2 ${maxHeightClass} overflow-y-auto`}>
      {items.map((it) => {
        const id = `${idPrefix}-${it.id}`;
        return (
          <div key={it.id} className="flex items-center space-x-3 group">
            <Checkbox id={id} checked={selected.includes(it.id)} onCheckedChange={() => onToggle(it.id)} className="w-4 h-4" />
            <Label htmlFor={id} className="text-sm cursor-pointer group-hover:text-foreground transition-colors">
              {it.label}
            </Label>
          </div>
        );
      })}
    </div>
  );
}

export const FilterCheckboxList = memo(FilterCheckboxListBase);


