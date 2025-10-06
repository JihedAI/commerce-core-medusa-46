import React, { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductSkeletonProps {
  count?: number;
  className?: string;
}

const ProductSkeleton = memo(({ count = 12, className = "" }: ProductSkeletonProps) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[4/5] rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
});

ProductSkeleton.displayName = "ProductSkeleton";

export default ProductSkeleton;
