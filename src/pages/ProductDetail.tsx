import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HttpTypes } from "@medusajs/types";
import { toast } from "sonner";
import { ArrowLeft, Heart, Share2, Minus, Plus, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import { sdk } from "@/lib/sdk";
import { useProductDetail, useRelatedProducts } from "@/hooks/useProducts";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Layout from "@/components/Layout";

// Price formatting utility
const formatPrice = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount / 1);
};

export default function ProductDetail() {
  const { t } = useTranslation();
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { cart, addItem } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<HttpTypes.StoreProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [region, setRegion] = useState<HttpTypes.StoreRegion | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Debug logging (temporary) - comment out after verifying fix
  // console.log("🔍 ProductDetail Debug:", {
  //   handle,
  //   regionId: region?.id,
  //   region: region
  // });

  // Fetch product using unified hook
  const { data: productData, isLoading: productLoading, error: productError } = useProductDetail(
    handle || "", 
    region?.id
  );

  // Debug product data (temporary)
  // console.log("📦 Product Data Debug:", {
  //   productData,
  //   isLoading: productLoading,
  //   error: productError,
  //   products: productData?.products,
  //   productsLength: productData?.products?.length
  // });

  // Set product data when loaded
  useEffect(() => {
    // console.log("🔄 Product Data Effect:", {
    //   productData,
    //   hasProducts: productData?.products?.length > 0,
    //   firstProduct: productData?.products?.[0]
    // });

    if (productData?.products && productData.products.length > 0) {
      const productInfo = productData.products[0];
      setProduct(productInfo);
      
      // Set default variant and image
      if (productInfo.variants && productInfo.variants.length > 0) {
        setSelectedVariant(productInfo.variants[0]);
      }
      
      const defaultImage = productInfo.thumbnail || productInfo.images?.[0]?.url || "/placeholder.svg";
      setSelectedImage(defaultImage);
      setCurrentImageIndex(0);
    }
  }, [productData]);

  // Fetch region on mount
  useEffect(() => {
    const fetchRegion = async () => {
      try {
        const { regions } = await sdk.store.region.list();
        const selectedRegion = regions?.[0] || null;
        setRegion(selectedRegion);
      } catch (regionError) {
        console.warn("Could not fetch regions:", regionError);
      }
    };
    fetchRegion();
  }, []);

  const isLoading = productLoading;
  const error = productError ? t('productDetail.notFoundOrFailed', { defaultValue: 'Product not found or failed to load.' }) : null;

  // Debug final state (temporary)
  // console.log("🎯 Final State Debug:", {
  //   isLoading,
  //   error,
  //   product,
  //   hasProduct: !!product,
  //   handle,
  //   regionId: region?.id
  // });

  // Fetch related products using unified hook
  const { data: relatedProductsData } = useRelatedProducts(
    product?.collection?.id || "", 
    region?.id, 
    6
  );
  
  const relatedProducts = relatedProductsData?.products?.filter(p => p.handle !== product?.handle) || [];


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
            <h1 className="text-2xl font-bold text-foreground mb-4">{t('productDetail.productNotFound', { defaultValue: 'Product Not Found' })}</h1>
            <p className="text-muted-foreground mb-6">{error || t('productDetail.doesntExist', { defaultValue: "The product you're looking for doesn't exist." })}</p>
            <Button onClick={() => navigate(-1)} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('common.goBack', { defaultValue: 'Go Back' })}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const currency = region?.currency_code || "USD";
  const price = selectedVariant?.calculated_price;

  return (
    <>
    <Layout>
      <div className="p-4 md:p-8 min-h-screen">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Left Column - Images (60%) */}
        <div className="w-full md:w-[60%]">
          {/* Main Product Image - larger, centered, clean */}
          <div className="group relative w-full h-[360px] sm:h-[420px] md:h-[720px] bg-muted/20 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <>
                <img
                  src={selectedImage || product.thumbnail || "/placeholder.svg"}
                  alt={product.title}
                  className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-[1.04]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                  onClick={() => setIsZoomOpen(true)}
                />
                {/* Fullscreen button */}
                <button
                  aria-label="Zoom image"
                  onClick={() => setIsZoomOpen(true)}
                  className="absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/70 text-foreground shadow-sm backdrop-blur hover:bg-background"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center rounded-xl">
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
        <div className="w-full md:w-[40%] space-y-6 md:space-y-8">
          {/* Product Name */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">
            {product.title}
          </h1>

          {/* Price */}
          <div className="mb-4 md:mb-6">
            {price?.calculated_amount_with_tax ? (
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(price.calculated_amount_with_tax, currency)}
                </span>
                {price.original_amount_with_tax && 
                 price.calculated_amount_with_tax !== price.original_amount_with_tax && (
                  <div className="flex flex-col">
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(price.original_amount_with_tax, currency)}
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      Save {Math.round(((price.original_amount_with_tax - price.calculated_amount_with_tax) / price.original_amount_with_tax) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            ) : price?.calculated_amount ? (
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(price.calculated_amount, currency)}
                </span>
                {price.original_amount && 
                 price.calculated_amount !== price.original_amount && (
                  <div className="flex flex-col">
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(price.original_amount, currency)}
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      Save {Math.round(((price.original_amount - price.calculated_amount) / price.original_amount) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            ) : (
                <span className="text-lg text-muted-foreground">
                {t('productDetail.priceInCart', { defaultValue: 'Price available in cart' })}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-4 md:mb-6">
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {product.description}
              </p>
            </div>
          )}

          {/* Color Variants */}
          {product.variants && product.variants.length > 1 && (
            <div className="mb-4 md:mb-6">
              <h4 className="text-lg font-medium text-foreground mb-3">{t('productDetail.availableOptions', { defaultValue: 'Available Options' })}</h4>
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
          <div className="mb-4 md:mb-6">
            <h4 className="text-lg font-medium text-foreground mb-3">{t('productDetail.quantity', { defaultValue: 'Quantity' })}</h4>
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
            className="w-full py-3 mb-4 md:mb-6 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-xl transition-all hover:shadow-xl"
          >
            {isAddingToCart ? t('productDetail.adding', { defaultValue: 'Adding...' }) : t('productDetail.addToBag', { defaultValue: 'Add to Bag' })}
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-4 md:mb-6">
            <Button variant="outline" size="sm" className="flex-1">
              <Heart className="w-4 h-4 mr-2" />
              {t('productDetail.save', { defaultValue: 'Save' })}
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              {t('productDetail.share', { defaultValue: 'Share' })}
            </Button>
          </div>

          {/* Product Details Accordion */}
          <Accordion type="single" collapsible className="mb-4 md:mb-6">
            <AccordionItem value="details">
              <AccordionTrigger className="text-lg font-medium">{t('productDetail.details', { defaultValue: 'Product Details' })}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm">
                  {product.weight && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">{t('productDetail.weight', { defaultValue: 'Weight' })}:</span>
                      <span className="text-foreground font-medium">{product.weight}g</span>
                    </div>
                  )}
                  {product.length && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">{t('productDetail.length', { defaultValue: 'Length' })}:</span>
                      <span className="text-foreground font-medium">{product.length}cm</span>
                    </div>
                  )}
                  {product.width && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">{t('productDetail.width', { defaultValue: 'Width' })}:</span>
                      <span className="text-foreground font-medium">{product.width}cm</span>
                    </div>
                  )}
                  {product.height && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">{t('productDetail.height', { defaultValue: 'Height' })}:</span>
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
                      {t('productDetail.noAdditional', { defaultValue: 'No additional product details available' })}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="shipping">
              <AccordionTrigger className="text-lg font-medium">{t('productDetail.shippingInfo', { defaultValue: 'Shipping Information' })}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('productDetail.standardShipping', { defaultValue: 'Standard Shipping (5-7 days)' })}:</span>
                    <span className="text-foreground font-medium">$9.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('productDetail.expressShipping', { defaultValue: 'Express Shipping (2-3 days)' })}:</span>
                    <span className="text-foreground font-medium">$19.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('productDetail.freeShipping', { defaultValue: 'Free shipping' })}:</span>
                    <span className="text-foreground font-medium">{t('productDetail.ordersOver', { defaultValue: 'Orders over $100' })}</span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-4">
                    {t('productDetail.shippingNote', { defaultValue: 'All orders are processed within 1-2 business days. You will receive a tracking number once your order has shipped.' })}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        </div>
      </div>

      {/* Similar Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="py-16 border-t border-border/40">

          <div className="container mx-auto px-0">
            {/* Section Header */}
            <div className="px-8 lg:px-16 mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                {t('productDetail.similarProducts', { defaultValue: 'Similar Products' })}
              </h2>
              <p className="text-muted-foreground">
                {t('productDetail.moreFrom', { defaultValue: 'More items from {{collection}}', collection: product.collection?.title || 'this collection' })}
              </p>
            </div>

            {/* Carousel-style Similar Products */}
            <div className="relative group w-full">
              <Carousel
                opts={{ align: 'start', loop: true, dragFree: true, skipSnaps: true }}
                className="w-full"
              >
                <CarouselContent className="-mx-4 sm:-mx-6">
                  {relatedProducts.slice(0, 12).map((p) => (
                    <CarouselItem key={p.id} className="px-4 sm:px-6 mx-3 basis-auto w-[390px] mobile:w-[140px] first:ml-4 sm:first:ml-6 last:mr-4 sm:last:mr-6">
                      <Link to={`/products/${p.handle}`} className="group/item block">
                        {/* Match homepage carousel image presentation */}
                        <div className="relative overflow-hidden w-[390px] h-[300px] mobile:w-[140px] mobile:h-[238px] rounded-xl">
                          <figure className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] mobile:w-[238px] mobile:h-[238px] md:w-[720px] md:h-[720px] transition-transform duration-700 group-hover/item:scale-110">
                            <img
                              src={p.thumbnail || "/placeholder.svg"}
                              alt={p.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                              }}
                            />
                          </figure>
                        </div>
                        <div className="mt-3 px-1">
                          <h3 className="text-sm md:text-base font-sans tracking-wide text-foreground line-clamp-2 leading-tight">
                            {p.title}
                          </h3>
                          {p.variants?.[0]?.calculated_price && (
                            <p className="text-xs md:text-sm text-muted-foreground mt-1">
                              {formatPrice(
                                p.variants[0].calculated_price.calculated_amount_with_tax ||
                                  p.variants[0].calculated_price.calculated_amount || 0,
                                currency
                              )}
                            </p>
                          )}
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CarouselNext className="-right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Carousel>
            </div>

            {/* View Collection Button */}
            {product.collection && (
              <div className="text-center mt-10 px-8 lg:px-16">
                <Button
                  onClick={() => navigate(`/collections/${product.collection?.handle || product.collection?.id}`)}
                  variant="ghost"
                  className="text-sm hover:bg-primary/10"
                >
                  {t('productDetail.viewAllIn', { defaultValue: 'View All in {{collection}}', collection: product.collection.title })}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>

    {/* Zoom Dialog */}
    <Dialog open={isZoomOpen} onOpenChange={(v) => { setIsZoomOpen(v); if (!v) setIsZoomed(false); }}>
      <DialogContent className="max-w-[95vw] md:max-w-[85vw] p-0 bg-background/90 border-0">
        <div className="relative w-full h-[80vh] md:h-[85vh] flex items-center justify-center overflow-hidden">
          <img
            src={selectedImage || product?.thumbnail || "/placeholder.svg"}
            alt={product?.title || "Product image"}
            className={`max-w-full max-h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-125 cursor-zoom-out' : 'scale-100 cursor-zoom-in'}`}
            onClick={() => setIsZoomed((z) => !z)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
    </>

  );
}