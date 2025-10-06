import React, { memo } from "react";

type Item = { value: string; label: string };

type Props = {
  name: string;
  value: string;
  onChange: (v: string) => void;
  items: Item[];
};

function FilterRadioListBase({ name, value, onChange, items }: Props) {
  return (
    <div className="space-y-2">
      {items.map((option) => (
        <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-3.5 h-3.5 text-primary border-border"
          />
          <span className="text-sm group-hover:text-foreground transition-colors">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

export const FilterRadioList = memo(FilterRadioListBase);


