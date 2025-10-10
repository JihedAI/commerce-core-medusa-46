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
import OptimizedImage from "@/components/OptimizedImage";

interface ProductCardProps {
  product: HttpTypes.StoreProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const defaultVariant = product.variants?.[0];
  const price = defaultVariant?.calculated_price;
  const images = product.images || [];
  const imageUrl = product.thumbnail || images[0]?.url;
  
  
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

  // Simplify hover behavior to match carousel style (no image cycling)

  const currentImage = images[currentImageIndex]?.url || imageUrl;

  return (
    <Link to={`/products/${product.handle}`}>
      <Card className="group relative overflow-visible transition-transform duration-300 hover:-translate-y-0.5 bg-card border-0 shadow-none">
        {/* Image Container - square like carousel, with subtle hover */}
        <div className="relative overflow-hidden aspect-square rounded-xl">
          <figure className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full transition-transform duration-700 group-hover:scale-105">
            {currentImage ? (
              <OptimizedImage
                src={currentImage}
                alt={product.title}
                className="h-full w-full object-cover"
                quality={80}
                priority={false}
                fit="cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </figure>

          {/* Minimalist badge */}
          {!hasStock && (
            <div className="absolute top-3 left-3">
              <Badge variant="destructive" className="text-xs px-2 py-1 font-medium">
                Sold Out
              </Badge>
            </div>
          )}
        </div>

        {/* Info below image to match carousel aesthetics */}
        <div className="pt-3">
          <h3 className="text-sm md:text-base font-sans tracking-wide text-foreground line-clamp-2 leading-tight">
            {product.title}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            {price && (
              <>
                <span className="text-xs md:text-sm font-medium text-foreground">
                  {(() => {
                    const amount = price.calculated_amount_with_tax || price.calculated_amount;
                    const currency = price.currency_code || "TND";
                    return formatPrice(amount, currency);
                  })()}
                </span>
                {price.original_amount_with_tax && 
                 price.calculated_amount_with_tax !== price.original_amount_with_tax && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(price.original_amount_with_tax, price.currency_code || "TND")}
                  </span>
                )}
                {price.original_amount && 
                 !price.original_amount_with_tax &&
                 price.calculated_amount !== price.original_amount && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(price.original_amount, price.currency_code || "TND")}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}