import React, { memo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { HttpTypes } from "@medusajs/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatPrice, truncateText } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import OptimizedImage from "./OptimizedImage";

interface ProductCardOptimizedProps {
  product: HttpTypes.StoreProduct;
}

// Optimized ProductCard with lazy loading and memoization
const ProductCardOptimized = memo(({ product }: ProductCardOptimizedProps) => {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const defaultVariant = product.variants?.[0];
  const price = defaultVariant?.calculated_price;
  const images = product.images || [];
  const imageUrl = product.thumbnail || images[0]?.url;
  
  const hasStock = defaultVariant?.inventory_quantity === undefined || 
                   defaultVariant?.inventory_quantity === null || 
                   defaultVariant?.inventory_quantity > 0;

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!defaultVariant) {
      toast({
        title: "No variant available",
        description: "This product is not available for purchase",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await addItem(defaultVariant.id, 1);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, [defaultVariant, addItem, toast]);

  // Memoize price calculation with original price
  const priceInfo = React.useMemo(() => {
    if (!price) return { current: "Price N/A", original: null };
    
    const currentAmount = price.calculated_amount_with_tax || price.calculated_amount || 0;
    const originalAmount = price.original_amount_with_tax || price.original_amount;
    const currency = price.currency_code || "USD";
    
    return {
      current: formatPrice(currentAmount, currency),
      original: originalAmount && originalAmount !== currentAmount
        ? formatPrice(originalAmount, currency)
        : null
    };
  }, [price]);

  return (
    <Card className="group relative overflow-visible bg-background border-0 shadow-none">
      <Link to={`/products/${product.handle}`} className="block">
        {/* Image Container: square, clean, object-cover like carousel */}
        <div className="relative overflow-hidden aspect-square rounded-xl">
          <figure className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] mobile:w-[238px] mobile:h-[238px] md:w-[720px] md:h-[720px] transition-transform duration-700 group-hover:scale-150">
            <OptimizedImage
              src={imageUrl || "/placeholder.svg"}
              alt={product.title}
              className="w-full h-full object-cover"
              fallback="/placeholder.svg"
              quality={85}
              sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
              fit="cover"
            />
          </figure>
          
          {/* Stock Badge */}
          {!hasStock && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              {t('products.outOfStock')}
            </Badge>
          )}
        </div>

        {/* Product Info below image to match carousel */}
        <div className="pt-3 space-y-1">
          <h3 className="text-sm md:text-base font-sans tracking-wide text-foreground line-clamp-2 leading-tight">
            {truncateText(product.title, 50)}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-medium text-foreground">
                {priceInfo.current}
              </span>
              {priceInfo.original && (
                <span className="text-xs text-muted-foreground line-through">
                  {priceInfo.original}
                </span>
              )}
            </div>
            
            {defaultVariant && hasStock && (
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={isLoading}
                className="h-8 w-8 p-0 rounded-full bg-foreground text-background hover:bg-foreground/90"
                aria-label={t('buttons.add') as string}
              >
                {isLoading ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
});

ProductCardOptimized.displayName = "ProductCardOptimized";

export default ProductCardOptimized;
