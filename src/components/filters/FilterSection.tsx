import React, { memo } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

type Props = {
  title: string;
  open: boolean;
  onOpenChange: () => void;
  children: React.ReactNode;
};

function FilterSectionBase({ title, open, onOpenChange, children }: Props) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
        <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">{title}</h3>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export const FilterSection = memo(FilterSectionBase);


