import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { HttpTypes } from "@medusajs/types";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface FloatingProductCardProps {
  product: HttpTypes.StoreProduct;
}

export default function FloatingProductCard({ product }: FloatingProductCardProps) {
  const defaultVariant = product.variants?.[0];
  const price = defaultVariant?.calculated_price;
  const imageUrl = product.thumbnail || product.images?.[0]?.url;

  return (
    <Link to={`/products/${product.handle}`} data-cursor-hover>
      <div className="group relative overflow-hidden transition-all duration-500 hover:scale-105" data-cursor-hover>
        {/* Product Image - Floating on neutral background */}
        <div className="relative aspect-square bg-muted/30 rounded-2xl overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="w-20 h-20 bg-muted rounded-full" />
            </div>
          )}
          
          {/* Hover Shadow Effect */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
          
          {/* Floating favorite button - bottom right */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute bottom-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-white/30"
            data-cursor-hover
            onClick={(e) => {
              e.preventDefault();
              // Add to wishlist logic here
            }}
          >
            <Heart className="h-4 w-4 text-foreground" />
          </Button>
        </div>

        {/* Product Info - Bottom Left Corner */}
        <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/60 via-black/40 to-transparent w-full">
          <h3 className="font-medium text-white text-sm line-clamp-1 mb-1">
            {product.title}
          </h3>
          {price && (
            <span className="font-semibold text-white text-lg">
              {(() => {
                const amount = price.calculated_amount_with_tax || price.calculated_amount;
                const currency = price.currency_code || "TND";
                return formatPrice(amount, currency);
              })()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}