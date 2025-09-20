import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HttpTypes } from "@medusajs/types";
import { toast } from "sonner";
import { ArrowLeft, Heart, Share2, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { sdk } from "@/lib/sdk";
import ProductCard from "@/components/ProductCard";
import Layout from "@/components/Layout";

// Price formatting utility
const formatPrice = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount / 1);
};

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<HttpTypes.StoreProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<HttpTypes.StoreProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [region, setRegion] = useState<HttpTypes.StoreRegion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch product and region data
  useEffect(() => {
    const fetchData = async () => {
      if (!handle) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch region first
        let selectedRegion: HttpTypes.StoreRegion | null = null;
        try {
          const { regions } = await sdk.store.region.list();
          selectedRegion = regions?.[0] || null;
        } catch (regionError) {
          console.warn("Could not fetch regions:", regionError);
        }
        
        setRegion(selectedRegion);
        
        // Fetch product by handle using the list method
        const queryParams: any = {
          handle,
          fields: "*variants.calculated_price,+variants.options,+images,+collection,+metadata,+weight,+length,+width,+height",
          limit: 1
        };
        
        if (selectedRegion) {
          queryParams.region_id = selectedRegion.id;
          if (selectedRegion.countries?.[0]) {
            queryParams.country_code = selectedRegion.countries[0].iso_2;
          }
        }
        
        const { products } = await sdk.store.product.list(queryParams);
        
        if (products && products.length > 0) {
          const productData = products[0];
          setProduct(productData);
          
          // Set default variant and image
          if (productData.variants && productData.variants.length > 0) {
            setSelectedVariant(productData.variants[0]);
          }
          
          const defaultImage = productData.thumbnail || productData.images?.[0]?.url || "/placeholder.svg";
          setSelectedImage(defaultImage);
          setCurrentImageIndex(0);
        } else {
          setError("Product not found");
        }
        
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Product not found or failed to load.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [handle]);

  // Fetch related products
  const { data: relatedProducts } = useQuery({
    queryKey: ["related-products", product?.collection?.id, region?.id],
    queryFn: async () => {
      if (!product?.collection?.id || !region) return [];
      
      const { products } = await sdk.store.product.list({
        collection_id: [product.collection.id],
        limit: 6,
        fields: "+variants.calculated_price,+images,+collection",
        region_id: region.id
      });
      
      // Filter out the current product
      return products?.filter(p => p.handle !== product.handle) || [];
    },
    enabled: !!product?.collection?.id && !!region,
  });

  // Fetch all products for explore section
  const { data: exploreProducts } = useQuery({
    queryKey: ["explore-products", region?.id, product?.id],
    queryFn: async () => {
      if (!region) return [];
      
      const { products } = await sdk.store.product.list({
        limit: 12,
        fields: "+variants.calculated_price,+images,+collection",
        region_id: region.id
      });
      
      // Filter out the current product
      return products?.filter(p => p.id !== product?.id) || [];
    },
    enabled: !!region && !!product,
  });

  const handleAddToCart = async () => {
    if (!selectedVariant || !region) {
      toast.error("Please select a variant");
      return;
    }

    try {
      setIsAddingToCart(true);
      await addItem(selectedVariant.id, quantity);
      toast.success("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleVariantSelect = (variant: HttpTypes.StoreProductVariant) => {
    setSelectedVariant(variant);
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!product?.images) return;
    
    const totalImages = product.images.length;
    let newIndex = currentImageIndex;
    
    if (direction === 'prev') {
      newIndex = currentImageIndex === 0 ? totalImages - 1 : currentImageIndex - 1;
    } else {
      newIndex = currentImageIndex === totalImages - 1 ? 0 : currentImageIndex + 1;
    }
    
    setCurrentImageIndex(newIndex);
    setSelectedImage(product.images[newIndex].url);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex" style={{ height: 'calc(100vh - 5rem)' }}>
          <div className="w-[70%] h-full">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="w-[30%] p-12 space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-10 h-10 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
        <div className="h-96 bg-muted animate-pulse" />
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "The product you're looking for doesn't exist."}</p>
            <Button onClick={() => navigate(-1)} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const currency = region?.currency_code || "USD";
  const price = selectedVariant?.calculated_price;

  return (
    <Layout>
      <div className="flex gap-8 p-8 min-h-screen">
        {/* Left Column - Images (60%) */}
        <div className="w-[60%]">
          {/* Main Product Image */}
          <div className="w-full h-[600px] relative overflow-hidden mb-4 rounded-lg">
            {product.images && product.images.length > 0 ? (
              <img
                src={selectedImage || product.thumbnail || "/placeholder.svg"}
                alt={product.title}
                className="w-full h-full object-contain transition-transform duration-700 hover:scale-110 animate-fade-in"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No image available</span>
              </div>
            )}
          </div>

          {/* Additional Images Row - Only show if more than one image */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setSelectedImage(image.url);
                  }}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIndex === index
                      ? 'border-primary'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${product.title} view ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Right Column - Product Details & Purchase (40%) */}
        <div className="w-[40%] space-y-8">
          {/* Product Name */}
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {product.title}
          </h1>

          {/* Price */}
          <div className="mb-6">
            {price?.calculated_amount_with_tax ? (
              <div className="flex items-baseline gap-4">
                <span className="text-2xl font-semibold text-foreground">
                  {formatPrice(price.calculated_amount_with_tax, currency)}
                </span>
                {price.original_amount_with_tax && 
                 price.calculated_amount_with_tax !== price.original_amount_with_tax && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(price.original_amount_with_tax, currency)}
                  </span>
                )}
              </div>
            ) : price?.calculated_amount ? (
              <span className="text-2xl font-semibold text-foreground">
                {formatPrice(price.calculated_amount, currency)}
              </span>
            ) : (
              <span className="text-lg text-muted-foreground">
                Price available in cart
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Color Variants */}
          {product.variants && product.variants.length > 1 && (
            <div className="mb-6">
              <h4 className="text-lg font-medium text-foreground mb-3">Available Options</h4>
              <div className="flex gap-3">
                {product.variants.map((variant, index) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantSelect(variant)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedVariant?.id === variant.id
                        ? 'border-foreground shadow-lg'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    style={{
                      backgroundColor: variant.options?.find(opt => opt.option?.title?.toLowerCase() === 'color')?.value || 
                        `hsl(${index * 60}, 50%, 60%)`
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-foreground mb-3">Quantity</h4>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-medium w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to Bag Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isAddingToCart || !selectedVariant}
            className="w-full py-3 mb-6 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-xl transition-all hover:shadow-xl"
          >
            {isAddingToCart ? "Adding..." : "Add to Bag"}
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <Button variant="outline" size="sm" className="flex-1">
              <Heart className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Product Details Accordion */}
          <Accordion type="single" collapsible className="mb-6">
            <AccordionItem value="details">
              <AccordionTrigger className="text-lg font-medium">Product Details</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm">
                  {product.weight && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Weight:</span>
                      <span className="text-foreground font-medium">{product.weight}g</span>
                    </div>
                  )}
                  {product.length && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Length:</span>
                      <span className="text-foreground font-medium">{product.length}cm</span>
                    </div>
                  )}
                  {product.width && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Width:</span>
                      <span className="text-foreground font-medium">{product.width}cm</span>
                    </div>
                  )}
                  {product.height && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Height:</span>
                      <span className="text-foreground font-medium">{product.height}cm</span>
                    </div>
                  )}
                  {product.metadata && Object.keys(product.metadata).length > 0 && (
                    Object.entries(product.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-foreground font-medium">{String(value)}</span>
                      </div>
                    ))
                  )}
                  {(!product.weight && !product.length && !product.width && !product.height && (!product.metadata || Object.keys(product.metadata).length === 0)) && (
                    <div className="text-center py-4 text-muted-foreground">
                      No additional product details available
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="shipping">
              <AccordionTrigger className="text-lg font-medium">Shipping Information</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standard Shipping (5-7 days):</span>
                    <span className="text-foreground font-medium">$9.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Express Shipping (2-3 days):</span>
                    <span className="text-foreground font-medium">$19.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Free shipping:</span>
                    <span className="text-foreground font-medium">Orders over $100</span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-4">
                    All orders are processed within 1-2 business days. You will receive a tracking number once your order has shipped.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Explore Our Products Section */}
      {exploreProducts && exploreProducts.length > 0 && (
        <div className="bg-background py-24">
          <div className="container mx-auto px-8">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-bold text-foreground mb-4 tracking-wide">
                Explore Our Products
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Discover our curated collection of premium products, each crafted with attention to detail and modern elegance.
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {exploreProducts.slice(0, 8).map((exploreProduct, index) => (
                <div
                  key={exploreProduct.id}
                  className="group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Link
                    to={`/products/${exploreProduct.handle}`}
                    className="block"
                  >
                    <div className="bg-card rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2 border border-border/50 hover:border-primary/20">
                      {/* Product Image */}
                      <div className="aspect-square overflow-hidden bg-muted relative">
                        <img
                          src={exploreProduct.thumbnail || "/placeholder.svg"}
                          alt={exploreProduct.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Quick Actions */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        <div className="space-y-3">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                            {exploreProduct.title}
                          </h3>
                          
                          {exploreProduct.collection && (
                            <Badge variant="secondary" className="text-xs">
                              {exploreProduct.collection.title}
                            </Badge>
                          )}
                          
                          {exploreProduct.variants?.[0]?.calculated_price && (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-foreground">
                                {formatPrice(
                                  exploreProduct.variants[0].calculated_price.calculated_amount_with_tax || 
                                  exploreProduct.variants[0].calculated_price.calculated_amount || 0,
                                  currency
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-16">
              <Button
                onClick={() => navigate('/products')}
                variant="outline"
                className="px-12 py-4 text-base font-medium rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
              >
                View All Products
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}