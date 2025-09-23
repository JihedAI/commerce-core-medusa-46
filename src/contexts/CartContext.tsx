import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { sdk } from "@/lib/sdk";
import type { HttpTypes } from "@medusajs/types";
import { useToast } from "@/hooks/use-toast";
import { useRegion } from "./RegionContext";

interface CartContextType {
  cart: HttpTypes.StoreCart | null;
  setCart: (cart: HttpTypes.StoreCart | null) => void;
  isLoading: boolean;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  applyDiscount: (code: string) => Promise<void>;
  removeDiscount: (code: string) => Promise<void>;
  setShippingAddress: (address: any) => Promise<void>;
  setBillingAddress: (address: any) => Promise<void>;
  setEmail: (email: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_ID_KEY = "medusa_cart_id";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentRegion } = useRegion();

  // Initialize or retrieve cart on mount
  useEffect(() => {
    if (!currentRegion) return; // Wait for region to load
    
    const initializeCart = async () => {
      try {
        setIsLoading(true);
        const cartId = localStorage.getItem(CART_ID_KEY);
        
        if (cartId) {
          try {
            const { cart } = await sdk.store.cart.retrieve(cartId);
            setCart(cart);
          } catch (error) {
            // Cart not found or expired, create new one
            await createNewCart();
          }
        } else {
          await createNewCart();
        }
      } catch (error) {
        console.error("Failed to initialize cart:", error);
        toast({
          title: "Error",
          description: "Failed to initialize shopping cart",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeCart();
  }, [currentRegion]);

  const createNewCart = async () => {
    try {
      if (!currentRegion) {
        throw new Error("No region selected");
      }

      const { cart } = await sdk.store.cart.create({
        region_id: currentRegion.id,
      });
      
      setCart(cart);
      localStorage.setItem(CART_ID_KEY, cart.id);
    } catch (error) {
      console.error("Failed to create cart:", error);
      throw error;
    }
  };

  const refreshCart = async () => {
    if (!cart) return;
    
    try {
      const { cart: updatedCart } = await sdk.store.cart.retrieve(cart.id);
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to refresh cart:", error);
    }
  };

  const addItem = async (variantId: string, quantity: number = 1) => {
    if (!cart) return;

    try {
      await sdk.store.cart.createLineItem(cart.id, {
        variant_id: variantId,
        quantity,
      });
      
      await refreshCart();
      
      toast({
        title: "Added to cart",
        description: `Item added successfully`,
      });
    } catch (error) {
      console.error("Failed to add item:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const updateItem = async (lineId: string, quantity: number) => {
    if (!cart) return;

    try {
      if (quantity === 0) {
        await removeItem(lineId);
        return;
      }

      await sdk.store.cart.updateLineItem(cart.id, lineId, {
        quantity,
      });
      
      await refreshCart();
    } catch (error) {
      console.error("Failed to update item:", error);
      toast({
        title: "Error",
        description: "Failed to update item quantity",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (lineId: string) => {
    if (!cart) return;

    try {
      await sdk.store.cart.deleteLineItem(cart.id, lineId);
      await refreshCart();
      
      toast({
        title: "Removed from cart",
        description: "Item removed successfully",
      });
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

  const applyDiscount = async (code: string) => {
    if (!cart) return;

    try {
      // Check if promotion already exists
      const currentPromotions = (cart as any).promotions || [];
      const discountExists = currentPromotions.some((promo: any) => promo.code === code);
      
      if (discountExists) {
        toast({
          title: "Already applied",
          description: "This promo code is already applied to your cart",
        });
        return;
      }

      // Use the standard cart update method to add promotions
      await sdk.store.cart.update(cart.id, {
        promo_codes: [code]
      } as any);
      
      await refreshCart();
      
      toast({
        title: "Promo code applied",
        description: `Successfully applied ${code}`,
      });
    } catch (error: any) {
      console.error("Failed to apply promotion:", error);
      const errorMessage = error?.message || "Invalid or expired promo code";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const removeDiscount = async (code: string) => {
    if (!cart) return;

    try {
      // Remove promotions by updating cart with empty promo_codes
      await sdk.store.cart.update(cart.id, {
        promo_codes: []
      } as any);
      
      await refreshCart();
      
      toast({
        title: "Promo code removed",
        description: `Removed ${code} from your cart`,
      });
    } catch (error) {
      console.error("Failed to remove discount:", error);
      toast({
        title: "Error", 
        description: "Failed to remove promo code",
        variant: "destructive",
      });
    }
  };

  const setShippingAddress = async (address: any) => {
    if (!cart) return;

    try {
      await sdk.store.cart.update(cart.id, {
        shipping_address: address,
      });
      
      await refreshCart();
    } catch (error) {
      console.error("Failed to set shipping address:", error);
      throw error;
    }
  };

  const setBillingAddress = async (address: any) => {
    if (!cart) return;

    try {
      await sdk.store.cart.update(cart.id, {
        billing_address: address,
      });
      
      await refreshCart();
    } catch (error) {
      console.error("Failed to set billing address:", error);
      throw error;
    }
  };

  const setEmail = async (email: string) => {
    if (!cart) return;

    try {
      await sdk.store.cart.update(cart.id, {
        email,
      });
      
      await refreshCart();
    } catch (error) {
      console.error("Failed to set email:", error);
      throw error;
    }
  };

  const clearCart = () => {
    localStorage.removeItem(CART_ID_KEY);
    setCart(null);
    createNewCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        isLoading,
        addItem,
        updateItem,
        removeItem,
        applyDiscount,
        removeDiscount,
        setShippingAddress,
        setBillingAddress,
        setEmail,
        refreshCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}