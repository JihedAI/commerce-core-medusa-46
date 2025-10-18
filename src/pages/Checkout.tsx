import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CreditCard, Truck, User, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";
import { sdk } from "@/lib/sdk";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { checkoutSchema, promoCodeSchema } from "@/lib/validation";
import { z } from "zod";

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    cart, 
    setCart, 
    setEmail, 
    setShippingAddress, 
    setBillingAddress, 
    clearCart, 
    refreshCart, 
    applyDiscount, 
    removeDiscount 
  } = useCart();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Promotion code state
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoMessageType, setPromoMessageType] = useState<"success" | "error" | "">("");
  
  // Rate limiting for promo codes
  const [promoAttemptCount, setPromoAttemptCount] = useState(0);
  const [lastPromoAttempt, setLastPromoAttempt] = useState(0);
  const [promoBlockedUntil, setPromoBlockedUntil] = useState(0);

  // Form data
  const [email, setEmailState] = useState("");
  const [shippingData, setShippingData] = useState({
    first_name: "",
    last_name: "",
    address_1: "",
    address_2: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "tn",
    phone: "",
  });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [selectedShipping, setSelectedShipping] = useState("");
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState("");

  // Shipping options state
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [calculatedPrices, setCalculatedPrices] = useState<Record<string, number>>({});
  
  // Payment providers state
  const [paymentProviders, setPaymentProviders] = useState<any[]>([]);

  // Fetch shipping options after shipping address is set
  useEffect(() => {
    if (!cart?.id || currentStep !== 2 || !cart.shipping_address) return;
    
    const fetchShippingOptions = async () => {
      try {
        // Get shipping options for the specific cart
        const response = await sdk.store.fulfillment.listCartOptions({
          cart_id: cart.id,
        });
        const shippingOptions = response.shipping_options || [];
        setShippingOptions(shippingOptions);
        if (shippingOptions.length) {
          setSelectedShipping(shippingOptions[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch shipping options:", error);
        toast({
          title: "Shipping Error",
          description: "Unable to load shipping options. Please check your address.",
          variant: "destructive",
        });
      }
    };

    fetchShippingOptions();
  }, [cart?.id, cart?.shipping_address, currentStep, toast]);

  // Fetch payment providers when reaching payment step
  useEffect(() => {
    if (!cart?.region_id || currentStep !== 3) return;
    
    const fetchPaymentProviders = async () => {
      try {
        const response = await sdk.store.payment.listPaymentProviders({
          region_id: cart.region_id,
        });
        const providers = response.payment_providers || [];
        setPaymentProviders(providers);
        
        // Set default payment provider or use existing one
        if (providers.length && !selectedPaymentProvider) {
          const existingProvider = cart.payment_collection?.payment_sessions?.[0]?.provider_id;
          setSelectedPaymentProvider(existingProvider || providers[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch payment providers:", error);
        toast({
          title: "Payment Error",
          description: "Unable to load payment options.",
          variant: "destructive",
        });
      }
    };

    fetchPaymentProviders();
  }, [cart?.region_id, currentStep, selectedPaymentProvider, toast]);

  // Calculate prices for calculated shipping options
  useEffect(() => {
    if (!cart || !shippingOptions.length) return;

    const calculatedOptions = shippingOptions.filter(
      (option) => option.price_type === "calculated"
    );

    if (calculatedOptions.length === 0) return;

    const promises = calculatedOptions.map((option) =>
      sdk.store.fulfillment.calculate(option.id, {
        cart_id: cart.id,
        data: {},
      })
    );

    Promise.allSettled(promises).then((results) => {
      const pricesMap: Record<string, number> = {};
      results
        .filter((result) => result.status === "fulfilled")
        .forEach((result: any) => {
          if (result.value?.shipping_option) {
            pricesMap[result.value.shipping_option.id] = result.value.shipping_option.amount;
          }
        });
      setCalculatedPrices(pricesMap);
    });
  }, [shippingOptions, cart]);

  const steps = [
    { number: 1, title: t('checkout.information', { defaultValue: 'Information' }), icon: User },
    { number: 2, title: t('checkout.shippingStep', { defaultValue: 'Shipping' }), icon: Truck },
    { number: 3, title: t('checkout.paymentStep', { defaultValue: 'Payment' }), icon: CreditCard },
  ];

  // Get applied promotions/discounts - handle both v1 and v2 formats
  const appliedPromotions = (cart as any)?.promotions || (cart as any)?.discounts || [];

  // Promotion handlers with rate limiting
  const handleApplyPromo = async () => {
    const now = Date.now();
    
    // Check if blocked
    if (now < promoBlockedUntil) {
      const remainingSeconds = Math.ceil((promoBlockedUntil - now) / 1000);
      toast({
        title: "Too many attempts",
        description: `Please wait ${remainingSeconds} seconds before trying again`,
        variant: "destructive",
      });
      return;
    }
    
    // Rate limit: 3 second cooldown
    if (now - lastPromoAttempt < 3000) {
      toast({
        title: "Please wait",
        description: "Wait 3 seconds before trying again",
        variant: "destructive",
      });
      return;
    }
    
    // Block after 5 failed attempts
    if (promoAttemptCount >= 5) {
      setPromoBlockedUntil(now + 300000); // 5 minute block
      toast({
        title: "Too many failed attempts",
        description: "Please contact support for help with promo codes",
        variant: "destructive",
      });
      return;
    }
    
    // Validate promo code format
    try {
      const validCode = promoCodeSchema.parse(promoCode);
      
      setLastPromoAttempt(now);
      setPromoAttemptCount(prev => prev + 1);
      
      await applyDiscount(validCode);
      
      // Reset on success
      setPromoAttemptCount(0);
      setPromoBlockedUntil(0);
      setPromoMessage("Promo code applied successfully!");
      setPromoMessageType("success");
      setPromoCode("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid format",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        setPromoMessage("This code cannot be applied to your order");
        setPromoMessageType("error");
      }
    }
  };

  const handleRemoveDiscount = async (code: string) => {
    await removeDiscount(code);
  };

  const handleEmailSubmit = async () => {
    // Validate all input fields
    try {
      const validatedData = checkoutSchema.parse({
        email,
        ...shippingData,
      });
      
      // Set email first
      await setEmail(validatedData.email);
      
      // Set shipping address with validated data
      await setShippingAddress({
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        address_1: validatedData.address_1,
        address_2: validatedData.address_2 || '',
        city: validatedData.city,
        province: validatedData.province || '',
        postal_code: validatedData.postal_code,
        country_code: validatedData.country_code,
        phone: validatedData.phone || '',
      });
      
      // Set billing address if same as shipping
      if (sameAsBilling) {
        await setBillingAddress({
          first_name: validatedData.first_name,
          last_name: validatedData.last_name,
          address_1: validatedData.address_1,
          address_2: validatedData.address_2 || '',
          city: validatedData.city,
          province: validatedData.province || '',
          postal_code: validatedData.postal_code,
          country_code: validatedData.country_code,
          phone: validatedData.phone || '',
        });
      }
      
      // Move to shipping step
      setCurrentStep(2);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save information. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleShippingSubmit = async () => {
    if (!selectedShipping || !cart?.id) {
      toast({
        title: "Select shipping",
        description: "Please select a shipping method",
        variant: "destructive",
      });
      return;
    }

    try {
      // Add shipping method to cart using JS SDK
      await sdk.store.cart.addShippingMethod(cart.id, {
        option_id: selectedShipping,
      });
      
      // Refresh cart to get updated information
      await refreshCart();
      
      setCurrentStep(3);
    } catch (error) {
      console.error("Shipping method error:", error);
      toast({
        title: "Error",
        description: "Failed to set shipping method",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSubmit = async () => {
    if (!cart || !selectedPaymentProvider) {
      toast({
        title: "Select payment method",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First, initialize payment session if not already done
      if (!cart.payment_collection?.payment_sessions?.length) {
        await sdk.store.payment.initiatePaymentSession(cart, {
          provider_id: selectedPaymentProvider,
        });
        
        // Refresh cart to get updated payment collection
        await refreshCart();
      }

      // Complete the cart
      const response = await sdk.store.cart.complete(cart.id);
      
      if (response.type === "cart" && response.cart) {
        // Cart completion failed
        console.error("Cart completion failed:", response.error);
        toast({
          title: "Checkout failed",
          description: typeof response.error === 'string' ? response.error : "There was an error processing your order",
          variant: "destructive",
        });
      } else if (response.type === "order" && response.order) {
        // Order placed successfully
        clearCart();
        navigate(`/order-confirmation/${response.order.id}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">{t('cart.emptyCart')}</h1>
          <Button onClick={() => navigate("/products")}>{t('cart.continueShopping')}</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div
                  className={`flex items-center ${
                    currentStep >= step.number ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      currentStep >= step.number
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground"
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="ml-2 font-medium hidden sm:inline">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="mx-4 h-5 w-5 text-muted-foreground" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <div className="space-y-8">
                {/* Contact Information Section */}
                <div className="space-y-6">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">{t('checkout.contactInfo', { defaultValue: 'Contact Information' })}</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">{t('forms.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmailState(e.target.value)}
                        placeholder="john@example.com"
                        required
                        className="mt-1 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Shipping Address Section */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">{t('checkout.shippingAddress')}</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">{t('forms.firstName')}</Label>
                        <Input
                          id="first_name"
                          value={shippingData.first_name}
                          onChange={(e) =>
                            setShippingData({ ...shippingData, first_name: e.target.value })
                          }
                          required
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name" className="text-xs font-medium text-muted-foreground">{t('forms.lastName')}</Label>
                        <Input
                          id="last_name"
                          value={shippingData.last_name}
                          onChange={(e) =>
                            setShippingData({ ...shippingData, last_name: e.target.value })
                          }
                          required
                          className="mt-1 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address_1" className="text-xs font-medium text-muted-foreground">{t('forms.address')}</Label>
                      <Input
                        id="address_1"
                        value={shippingData.address_1}
                        onChange={(e) =>
                          setShippingData({ ...shippingData, address_1: e.target.value })
                        }
                        placeholder="123 Main St"
                        required
                        className="mt-1 text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address_2" className="text-xs font-medium text-muted-foreground">{t('checkout.address2', { defaultValue: 'Apartment, suite, etc. (optional)' })}</Label>
                      <Input
                        id="address_2"
                        value={shippingData.address_2}
                        onChange={(e) =>
                          setShippingData({ ...shippingData, address_2: e.target.value })
                        }
                        className="mt-1 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-xs font-medium text-muted-foreground">{t('forms.city')}</Label>
                        <Input
                          id="city"
                          value={shippingData.city}
                          onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                          required
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="province" className="text-xs font-medium text-muted-foreground">{t('checkout.stateProvince', { defaultValue: 'State/Province' })}</Label>
                        <Input
                          id="province"
                          value={shippingData.province}
                          onChange={(e) =>
                            setShippingData({ ...shippingData, province: e.target.value })
                          }
                          required
                          className="mt-1 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postal_code" className="text-xs font-medium text-muted-foreground">{t('forms.postalCode')}</Label>
                        <Input
                          id="postal_code"
                          value={shippingData.postal_code}
                          onChange={(e) =>
                            setShippingData({ ...shippingData, postal_code: e.target.value })
                          }
                          required
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">{t('forms.phone')}</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingData.phone}
                          onChange={(e) =>
                            setShippingData({ ...shippingData, phone: e.target.value })
                          }
                          className="mt-1 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="same-billing"
                        checked={sameAsBilling}
                        onChange={(e) => setSameAsBilling(e.target.checked)}
                        className="h-4 w-4 rounded border-border"
                      />
                      <Label htmlFor="same-billing" className="text-xs text-muted-foreground">{t('checkout.sameAsBilling', { defaultValue: 'Billing address same as shipping' })}</Label>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Continue Button */}
                <div className="pt-4">
                  <Button 
                    onClick={handleEmailSubmit} 
                    className="w-full h-12 bg-foreground text-background font-bold text-sm rounded-lg hover:bg-foreground/90 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    {t('checkout.continueToPayment', { defaultValue: 'Continue to Payment' })}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="space-y-6">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">{t('checkout.shippingMethod')}</h2>
                  
                  {!cart?.shipping_address ? (
                    <div className="text-center py-12">
                      <p className="text-xs text-muted-foreground mb-4">{t('checkout.setAddressFirst', { defaultValue: 'Please set your shipping address first.' })}</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep(1)} 
                        className="text-xs h-9 px-6"
                      >
                        {t('checkout.backToAddress', { defaultValue: 'Back to Address' })}
                      </Button>
                    </div>
                  ) : shippingOptions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-xs text-muted-foreground">{t('checkout.loadingShipping', { defaultValue: 'Loading shipping options...' })}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                        <div className="space-y-3">
                          {shippingOptions.map((option) => {
                            // Get the price for the option
                            const price = option.price_type === "flat" 
                              ? option.amount 
                              : calculatedPrices[option.id] || 0;
                            
                            return (
                              <div
                                key={option.id}
                                className="flex items-center justify-between py-4 px-1 border-b border-border/30 hover:border-border transition-colors"
                              >
                                <div className="flex items-center space-x-4">
                                  <RadioGroupItem value={option.id} id={option.id} className="mt-0.5" />
                                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium text-foreground">{option.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {option.data?.delivery_estimate || t('checkout.standardDelivery', { defaultValue: 'Standard delivery' })}
                                      </p>
                                    </div>
                                  </Label>
                                </div>
                                <span className="text-sm font-bold text-foreground">
                                  {price > 0 ? formatPrice(price, cart?.region?.currency_code) : t('checkout.free', { defaultValue: 'Free' })}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>

                <Separator className="bg-border/50" />

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)} 
                    className="flex-1 h-12 text-xs font-medium rounded-lg border-border/50 hover:border-border"
                  >
                    {t('buttons.goBack')}
                  </Button>
                  <Button 
                    onClick={handleShippingSubmit} 
                    className="flex-1 h-12 bg-foreground text-background font-bold text-sm rounded-lg hover:bg-foreground/90 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    {t('checkout.continueToPayment', { defaultValue: 'Continue to Payment' })}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="space-y-6">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">{t('checkout.paymentMethod')}</h2>
                  
                  {/* Test Mode Notice */}
                  <div className="py-4 px-1 border-b border-border/30">
                    <p className="text-xs font-bold text-foreground mb-2">{t('checkout.testMode', { defaultValue: 'Test Mode' })}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('checkout.demoNote', { defaultValue: 'This is a demo checkout. No real payment will be processed.' })}
                    </p>
                  </div>

                  {paymentProviders.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-xs text-muted-foreground">{t('checkout.loadingPayment', { defaultValue: 'Loading payment options...' })}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <RadioGroup value={selectedPaymentProvider} onValueChange={setSelectedPaymentProvider}>
                        <div className="space-y-3">
                          {paymentProviders.map((provider) => (
                            <div key={provider.id} className="flex items-center space-x-4 py-4 px-1 border-b border-border/30 hover:border-border transition-colors">
                              <RadioGroupItem value={provider.id} id={provider.id} className="mt-0.5" />
                              <Label htmlFor={provider.id} className="flex-1 cursor-pointer">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-3">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                      {provider.id.includes('stripe') ? t('checkout.stripePayment', { defaultValue: 'Stripe Payment' }) :
                                       provider.id.includes('system_default') ? t('checkout.manualPayment', { defaultValue: 'Manual Payment' }) :
                                       provider.id}
                                    </span>
                                  </div>
                                  {provider.id.includes('system_default') && (
                                    <p className="text-xs text-muted-foreground ml-7">
                                      {t('checkout.noAdditionalActions', { defaultValue: 'No additional actions required' })}
                                    </p>
                                  )}
                                </div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>

                <Separator className="bg-border/50" />

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(2)} 
                    className="flex-1 h-12 text-xs font-medium rounded-lg border-border/50 hover:border-border"
                  >
                    {t('buttons.goBack')}
                  </Button>
                  <Button
                    onClick={handlePaymentSubmit}
                    disabled={isLoading || !selectedPaymentProvider}
                    className="flex-1 h-12 bg-foreground text-background font-bold text-sm rounded-lg hover:bg-foreground/90 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:transform-none disabled:hover:shadow-none"
                  >
                    {isLoading ? t('checkout.processing', { defaultValue: 'Processing...' }) : t('checkout.completeOrder', { defaultValue: 'Complete Order' })}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">{t('checkout.orderSummary')}</h2>
              
              <div className="space-y-4">
                {cart.items.map((item) => {
                  const unit = (item as any).unit_price ?? (((item as any).subtotal || 0) / Math.max(1, item.quantity));
                  const thumb = (item as any).thumbnail || (item as any).product?.thumbnail || "/placeholder.svg";
                  return (
                    <div key={item.id} className="flex items-start gap-3 py-2">
                      <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                        <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground truncate">{item.product_title || item.title}</h3>
                      {item.variant && (
                          <p className="text-xs text-muted-foreground truncate">{item.variant.title}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('checkout.qty')}: {item.quantity} · {formatPrice(unit || 0, cart.currency_code)} {t('orders.each', { defaultValue: 'each' })}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium">{formatPrice((item as any).subtotal || (unit * item.quantity) || 0, cart.currency_code)}</p>
                    </div>
                  </div>
                  );
                })}
              </div>

              <Separator className="bg-border/50" />

              {/* Promotion Code Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">{t('checkout.promotionCode')}</h3>
                
                {/* Promotion Message */}
                {promoMessage && (
                  <div className={`text-xs font-bold ${promoMessageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {promoMessage}
                  </div>
                )}
                
                {/* Applied Promotions */}
                {appliedPromotions.length > 0 && (
                  <div className="space-y-2">
                    {appliedPromotions.map((promo: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                        <span className="text-xs font-medium text-green-700 dark:text-green-300">
                          {promo.code || promo.display_id}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDiscount(promo.code || promo.display_id)}
                          className="h-6 w-6 p-0 text-green-700 dark:text-green-300"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder={t('checkout.enterCode') as string}
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      if (promoMessage) {
                        setPromoMessage("");
                        setPromoMessageType("");
                      }
                    }}
                    className="text-xs h-9"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleApplyPromo} 
                    size="sm"
                    className="text-xs h-9 px-3"
                  >
                    {t('checkout.apply')}
                  </Button>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Order Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t('cart.subtotal', { defaultValue: 'Subtotal' })}</span>
                  <span className="font-medium">{formatPrice(cart.subtotal || 0, cart.currency_code)}</span>
                </div>
                
                {(cart as any).discount_total > 0 && (
                  <div className="flex justify-between text-xs text-green-600 dark:text-green-400">
                    <span>{t('cart.discount', { defaultValue: 'Discount' })}</span>
                    <span className="font-medium">-{formatPrice((cart as any).discount_total || 0, cart.currency_code)}</span>
                  </div>
                )}
                
                {cart.shipping_total !== undefined && cart.shipping_total > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{t('cart.shipping', { defaultValue: 'Shipping' })}</span>
                    <span className="font-medium">{formatPrice(cart.shipping_total || 0, cart.currency_code)}</span>
                  </div>
                )}
                
                {cart.tax_total !== undefined && cart.tax_total > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{t('cart.tax', { defaultValue: 'Tax' })}</span>
                    <span className="font-medium">{formatPrice(cart.tax_total || 0, cart.currency_code)}</span>
                  </div>
                )}
                
                <Separator className="bg-border/50" />
                
                <div className="flex justify-between font-bold text-sm pt-2">
                  <span>{t('cart.total', { defaultValue: 'Total' })}</span>
                  <span>{formatPrice(cart.total || 0, cart.currency_code)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}