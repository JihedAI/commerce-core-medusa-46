import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { FilterSidebar } from "./FilterSidebar";

type Props = React.PropsWithChildren<{
  triggerLabel?: string;
  sidebarProps: React.ComponentProps<typeof FilterSidebar>;
}>;

export function FilterDrawer({ triggerLabel = "Filters", sidebarProps }: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex-shrink-0">
          <Filter className="h-4 w-4 mr-2" />
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="p-6 overflow-y-auto">
          <FilterSidebar {...sidebarProps} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default FilterDrawer;


