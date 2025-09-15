import React, { useState, useEffect } from "react";
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

export default function Checkout() {
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
    { number: 1, title: "Information", icon: User },
    { number: 2, title: "Shipping", icon: Truck },
    { number: 3, title: "Payment", icon: CreditCard },
  ];

  // Get applied promotions/discounts - handle both v1 and v2 formats
  const appliedPromotions = (cart as any)?.promotions || (cart as any)?.discounts || [];

  // Promotion handlers
  const handleApplyPromo = async () => {
    if (promoCode.trim()) {
      try {
        await applyDiscount(promoCode.trim());
        setPromoMessage("Promo code applied successfully!");
        setPromoMessageType("success");
        setPromoCode("");
      } catch (error) {
        setPromoMessage("Invalid promo code. Please try again.");
        setPromoMessageType("error");
      }
    }
  };

  const handleRemoveDiscount = async (code: string) => {
    await removeDiscount(code);
  };

  const handleEmailSubmit = async () => {
    if (!email || !shippingData.first_name || !shippingData.last_name || !shippingData.address_1 || !shippingData.city) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields including address",
        variant: "destructive",
      });
      return;
    }

    try {
      // Set email first
      await setEmail(email);
      
      // Set shipping address - this is crucial for shipping options to work
      await setShippingAddress(shippingData);
      
      // Set billing address if same as shipping
      if (sameAsBilling) {
        await setBillingAddress(shippingData);
      }
      
      // Move to shipping step
      setCurrentStep(2);
    } catch (error) {
      console.error("Failed to save information:", error);
      toast({
        title: "Error",
        description: "Failed to save information. Please try again.",
        variant: "destructive",
      });
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
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Button onClick={() => navigate("/products")}>Continue Shopping</Button>
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
                  <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Contact Information</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email Address</Label>
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
                  <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Shipping Address</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name" className="text-xs font-medium text-muted-foreground">First Name</Label>
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
                        <Label htmlFor="last_name" className="text-xs font-medium text-muted-foreground">Last Name</Label>
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
                      <Label htmlFor="address_1" className="text-xs font-medium text-muted-foreground">Street Address</Label>
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
                      <Label htmlFor="address_2" className="text-xs font-medium text-muted-foreground">Apartment, suite, etc. (optional)</Label>
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
                        <Label htmlFor="city" className="text-xs font-medium text-muted-foreground">City</Label>
                        <Input
                          id="city"
                          value={shippingData.city}
                          onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                          required
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="province" className="text-xs font-medium text-muted-foreground">State/Province</Label>
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
                        <Label htmlFor="postal_code" className="text-xs font-medium text-muted-foreground">ZIP/Postal Code</Label>
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
                        <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">Phone</Label>
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
                      <Label htmlFor="same-billing" className="text-xs text-muted-foreground">Billing address same as shipping</Label>
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
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Shipping Method</h2>
                {!cart?.shipping_address ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Please set your shipping address first.</p>
                    <Button variant="outline" onClick={() => setCurrentStep(1)} className="mt-2">
                      Back to Address
                    </Button>
                  </div>
                ) : shippingOptions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading shipping options...</p>
                  </div>
                ) : (
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
                            className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value={option.id} id={option.id} />
                              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                <div>
                                  <p className="font-medium">{option.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {option.data?.delivery_estimate || "Standard delivery"}
                                  </p>
                                </div>
                              </Label>
                            </div>
                            <span className="font-semibold">
                              {price > 0 ? formatPrice(price, cart?.region?.currency_code) : "Free"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                )}

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleShippingSubmit} className="flex-1">
                    Continue to Payment
                  </Button>
                </div>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground mb-2">Test Mode</p>
                    <p className="text-sm">
                      This is a demo checkout. No real payment will be processed.
                    </p>
                  </div>

                  {paymentProviders.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading payment options...</p>
                    </div>
                  ) : (
                    <RadioGroup value={selectedPaymentProvider} onValueChange={setSelectedPaymentProvider}>
                      <div className="space-y-3">
                        {paymentProviders.map((provider) => (
                          <div key={provider.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary transition-colors">
                            <RadioGroupItem value={provider.id} id={provider.id} />
                            <Label htmlFor={provider.id} className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                <span>
                                  {provider.id.includes('stripe') ? 'Stripe Payment' :
                                   provider.id.includes('system_default') ? 'Manual Payment' :
                                   provider.id}
                                </span>
                              </div>
                              {provider.id.includes('system_default') && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  No additional actions required
                                </p>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={handlePaymentSubmit}
                      disabled={isLoading || !selectedPaymentProvider}
                      className="flex-1"
                    >
                      {isLoading ? "Processing..." : "Complete Order"}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Order Summary</h2>
              
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start py-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-foreground">{item.product_title || item.title}</h3>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      {item.variant && (
                        <p className="text-xs text-muted-foreground">
                          {item.variant.title}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatPrice(item.subtotal || 0, cart.currency_code)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="bg-border/50" />

              {/* Promotion Code Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">Promotion Code</h3>
                
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
                    placeholder="Enter code"
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
                    Apply
                  </Button>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Order Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(cart.subtotal || 0, cart.currency_code)}</span>
                </div>
                
                {(cart as any).discount_total > 0 && (
                  <div className="flex justify-between text-xs text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span className="font-medium">-{formatPrice((cart as any).discount_total || 0, cart.currency_code)}</span>
                  </div>
                )}
                
                {cart.shipping_total !== undefined && cart.shipping_total > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{formatPrice(cart.shipping_total || 0, cart.currency_code)}</span>
                  </div>
                )}
                
                {cart.tax_total !== undefined && cart.tax_total > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{formatPrice(cart.tax_total || 0, cart.currency_code)}</span>
                  </div>
                )}
                
                <Separator className="bg-border/50" />
                
                <div className="flex justify-between font-bold text-sm pt-2">
                  <span>Total</span>
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