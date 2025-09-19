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
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const defaultVariant = product.variants?.[0];
  const price = defaultVariant?.calculated_price;
  const images = product.images || [];
  const imageUrl = product.thumbnail || images[0]?.url;
  
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

  // Cycle through images on hover
  const handleMouseEnter = () => {
    if (images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 800);
    }
  };

  const handleMouseLeave = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentImageIndex(0);
  };

  // Cleanup interval on unmount
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const currentImage = images[currentImageIndex]?.url || imageUrl;

  return (
    <Link to={`/products/${product.handle}`}>
      <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 bg-card border-0 shadow-sm">
        {/* Image Container */}
        <div 
          className="relative aspect-square overflow-hidden bg-muted/30"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {currentImage ? (
            <img
              src={currentImage}
              alt={product.title}
              className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* Image Dots Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-primary' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Minimalist Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {!hasStock && (
              <Badge variant="destructive" className="text-xs px-2 py-1 font-medium">
                Sold Out
              </Badge>
            )}
          </div>

          {/* Quick Actions - More Minimalist */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white text-foreground shadow-sm"
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
          </div>

          {/* Modern Add to Cart Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <Button
                size="sm"
                className="w-full bg-white text-foreground hover:bg-white/90 font-medium"
                onClick={handleAddToCart}
                disabled={isLoading || !hasStock}
              >
                {isLoading ? "Adding..." : hasStock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </div>

        {/* Clean Product Info */}
        <div className="p-4 space-y-2">
          <div className="space-y-1">
            <h3 className="font-medium text-base line-clamp-1 text-foreground">{product.title}</h3>
            {product.collection && (
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {product.collection.title}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-1">
            {price && (
              <span className="font-semibold text-lg text-foreground">
                {(() => {
                  const amount = price.calculated_amount_with_tax || price.calculated_amount;
                  const currency = price.currency_code || "TND";
                  return formatPrice(amount, currency);
                })()}
              </span>
            )}
            {hasStock && defaultVariant?.inventory_quantity !== undefined && 
             defaultVariant?.inventory_quantity !== null && defaultVariant.inventory_quantity <= 5 && (
              <span className="text-xs text-amber-600 font-medium">
                Only {defaultVariant.inventory_quantity} left
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}