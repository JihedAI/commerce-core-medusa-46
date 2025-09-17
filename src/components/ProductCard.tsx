import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart, Eye } from "lucide-react";
import { HttpTypes } from "@medusajs/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatPrice, truncateText } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: HttpTypes.StoreProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const defaultVariant = product.variants?.[0];
  const price = defaultVariant?.calculated_price;
  const imageUrl = product.thumbnail || product.images?.[0]?.url;
  
  // Debug logging
  console.log('Product:', product.title);
  console.log('Default variant:', defaultVariant);
  console.log('Price object:', price);
  console.log('Price amount:', price?.calculated_amount || price?.calculated_amount_with_tax);
  console.log('Price currency:', price?.currency_code);
  
  const hasStock = defaultVariant?.inventory_quantity === undefined || 
                   defaultVariant?.inventory_quantity === null || 
                   defaultVariant?.inventory_quantity > 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
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
      await addItem(defaultVariant.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link to={`/products/${product.handle}`}>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg touch-target">
        {/* Image Container - Responsive aspect ratio */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
            </div>
          )}

          {/* Badges - Responsive positioning */}
          <div className="absolute top-1 sm:top-2 left-1 sm:left-2 flex flex-col gap-1">
            {product.collection && (
              <Badge variant="secondary" className="shadow-sm text-xs">
                {product.collection.title}
              </Badge>
            )}
            {!hasStock && (
              <Badge variant="destructive" className="shadow-sm text-xs">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Quick Actions - Touch-friendly */}
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex flex-col gap-1 sm:gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 sm:h-10 sm:w-10 shadow-lg touch-target"
              onClick={(e) => {
                e.preventDefault();
                toast({
                  title: "Added to wishlist",
                  description: `${product.title} has been added to your wishlist`,
                });
              }}
            >
              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="h-8 w-8 sm:h-10 sm:w-10 shadow-lg touch-target">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>

          {/* Add to Cart Button - Touch-friendly */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full transition-transform group-hover:translate-y-0">
            <Button
              className="w-full rounded-none touch-target text-sm"
              onClick={handleAddToCart}
              disabled={isLoading || !hasStock}
            >
              {isLoading ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>

        {/* Product Info - Responsive spacing and typography */}
        <div className="p-3 sm:p-4">
          <h3 className="font-medium text-fluid-sm line-clamp-1">{product.title}</h3>
          {product.description && (
            <p className="mt-1 text-fluid-xs text-muted-foreground line-clamp-2">
              {truncateText(product.description, 60)}
            </p>
          )}
          <div className="mt-2 sm:mt-3 flex items-center justify-between gap-2">
            {price && (
              <span className="font-semibold text-fluid-lg">
                {(() => {
                  const amount = price.calculated_amount_with_tax || price.calculated_amount;
                  const currency = price.currency_code || "TND";
                  return formatPrice(amount, currency);
                })()}
              </span>
            )}
            {defaultVariant?.inventory_quantity !== undefined && 
             defaultVariant?.inventory_quantity !== null && (
              <span className="text-fluid-xs text-muted-foreground">
                {defaultVariant.inventory_quantity > 0
                  ? `${defaultVariant.inventory_quantity} in stock`
                  : "Out of stock"}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}