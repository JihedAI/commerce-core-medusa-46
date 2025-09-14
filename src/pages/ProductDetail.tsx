import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Minus, Plus, Share2, Truck, Shield, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { HttpTypes } from "@medusajs/types";
import { sdk } from "@/lib/sdk";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";

// Price formatting utility
const formatPrice = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", { 
    style: "currency", 
    currency: currency.toUpperCase() 
  }).format(amount / 100)
}

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<HttpTypes.StoreProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<HttpTypes.StoreProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [region, setRegion] = useState<HttpTypes.StoreRegion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProductAndRegion = async () => {
      if (!handle) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Fetch region first
        let selectedRegion: HttpTypes.StoreRegion | null = null
        try {
          const { regions } = await sdk.store.region.list()
          selectedRegion = regions?.[0] || null
        } catch (regionError) {
          console.warn("Could not fetch regions:", regionError)
        }
        
        setRegion(selectedRegion)
        
        // Fetch product by handle using the list method
        const queryParams: any = {
          handle,
          fields: "+variants.calculated_price,+variants.options,+images,+collection",
          limit: 1
        }
        
        if (selectedRegion) {
          queryParams.region_id = selectedRegion.id
          if (selectedRegion.countries?.[0]) {
            queryParams.country_code = selectedRegion.countries[0].iso_2
          }
        }
        
        const { products } = await sdk.store.product.list(queryParams)
        
        if (products && products.length > 0) {
          const productData = products[0]
          setProduct(productData)
          
          // Set default variant and image
          if (productData.variants && productData.variants.length > 0) {
            setSelectedVariant(productData.variants[0])
          }
          
          const defaultImage = productData.thumbnail || productData.images?.[0]?.url || "/placeholder.svg"
          setSelectedImage(defaultImage)
        } else {
          setError("Product not found")
        }
        
      } catch (err) {
        console.error("Failed to fetch product:", err)
        setError("Product not found or failed to load.")
      } finally {
        setLoading(false)
      }
    }

    fetchProductAndRegion()
  }, [handle])

  // Fetch related products
  const { data: relatedProducts } = useQuery({
    queryKey: ["related-products", product?.collection?.id, region?.id],
    queryFn: async () => {
      if (!product?.collection?.id || !region) return [];
      const { products } = await sdk.store.product.list({
        collection_id: [product.collection.id],
        limit: 4,
        fields: "+variants.calculated_price,+images,+collection",
        region_id: region.id
      });
      return products.filter((p) => p.handle !== product.handle);
    },
    enabled: !!product?.collection?.id && !!region,
  });

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast({
        title: "Please select a variant",
        description: "Choose a product variant before adding to cart.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await addItem(selectedVariant.id, quantity);
      toast({
        title: "Added to cart!",
        description: `${product?.title} has been added to your cart.`,
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariantSelect = (variant: HttpTypes.StoreProductVariant) => {
    setSelectedVariant(variant)
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-6 w-24 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-md" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">
              {error || "Product not found"}
            </h2>
            <Button onClick={() => navigate("/products")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const currency = region?.currency_code || "USD";
  const price = selectedVariant?.calculated_price;
  const images = product.images || [];
  const currentImage = selectedImage || product.thumbnail;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/products")}
          className="mb-6 p-0 h-auto text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gradient-secondary">
              <img
                src={currentImage}
                alt={product.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg"
                }}
              />
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image.url)}
                    className={`aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                      selectedImage === image.url 
                        ? "border-brand" 
                        : "border-transparent hover:border-muted-foreground"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.title} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {product.title}
              </h1>
              
              {/* Price */}
              <div className="space-y-1">
                {price?.calculated_amount_with_tax ? (
                  <>
                    <p className="text-2xl font-bold">
                      {formatPrice(price.calculated_amount_with_tax, currency)}
                    </p>
                    {price.original_amount_with_tax && 
                     price.calculated_amount_with_tax !== price.original_amount_with_tax && (
                      <p className="text-lg text-muted-foreground line-through">
                        {formatPrice(price.original_amount_with_tax, currency)}
                      </p>
                    )}
                  </>
                ) : price?.calculated_amount ? (
                  <p className="text-2xl font-bold">
                    {formatPrice(price.calculated_amount, currency)}
                  </p>
                ) : (
                  <p className="text-lg text-muted-foreground">
                    Price available in cart
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 1 && (
              <div>
                <h3 className="font-semibold mb-3">Options</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {product.variants.map((variant) => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant?.id === variant.id ? "default" : "outline"}
                      onClick={() => handleVariantSelect(variant)}
                      className="text-sm"
                    >
                      {variant.title || `Variant ${variant.id.slice(-4)}`}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Collection */}
            {product.collection && (
              <div>
                <Badge variant="secondary" className="mb-4">
                  {product.collection.title}
                </Badge>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Button 
                onClick={handleAddToCart}
                className="w-full bg-gradient-primary text-brand-foreground shadow-brand hover:shadow-lg transition-all duration-200"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add to Cart"}
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Heart className="mr-2 h-4 w-4" />
                  Wishlist
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 border-t pt-6">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Free shipping on orders over $100</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Secure payment & buyer protection</span>
              </div>
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">30-day easy returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Product Details</h3>
                <div className="space-y-2 text-sm">
                  {product.metadata?.material && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Material:</span>
                      <span>{product.metadata.material as string}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight:</span>
                      <span>{product.weight}g</span>
                    </div>
                  )}
                  {product.length && product.width && product.height && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions:</span>
                      <span>
                        {product.length} x {product.width} x {product.height} cm
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="shipping" className="mt-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Shipping Information</h3>
                <div className="space-y-4 text-sm">
                  <p>We offer worldwide shipping with the following options:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Standard Shipping (5-7 business days): $9.99</li>
                    <li>Express Shipping (2-3 business days): $19.99</li>
                    <li>Free shipping on orders over $100</li>
                  </ul>
                  <p>
                    All orders are processed within 1-2 business days. You will receive a
                    tracking number once your order has shipped.
                  </p>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Customer Reviews</h3>
                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-display font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}