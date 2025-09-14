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
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.collection && (
              <Badge variant="secondary" className="shadow-sm">
                {product.collection.title}
              </Badge>
            )}
            {!hasStock && (
              <Badge variant="destructive" className="shadow-sm">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 shadow-lg"
              onClick={(e) => {
                e.preventDefault();
                toast({
                  title: "Added to wishlist",
                  description: `${product.title} has been added to your wishlist`,
                });
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="h-8 w-8 shadow-lg">
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart Button */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full transition-transform group-hover:translate-y-0">
            <Button
              className="w-full rounded-none"
              onClick={handleAddToCart}
              disabled={isLoading || !hasStock}
            >
              {isLoading ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-medium text-sm line-clamp-1">{product.title}</h3>
          {product.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {truncateText(product.description, 60)}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between">
            {price && (
              <span className="font-semibold text-lg">
                {(() => {
                  const amount = price.calculated_amount_with_tax || price.calculated_amount;
                  const currency = price.currency_code || "TND";
                  return formatPrice(amount, currency);
                })()}
              </span>
            )}
            {defaultVariant?.inventory_quantity !== undefined && 
             defaultVariant?.inventory_quantity !== null && (
              <span className="text-xs text-muted-foreground">
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