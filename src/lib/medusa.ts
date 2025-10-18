import Medusa from "@medusajs/medusa-js";

// Initialize Medusa SDK with backend configuration using environment variables
const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || "https://api.amine.agency";
const MEDUSA_PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || "pk_4b2ca5103e173cdd941ec632e69148a9057c7ac2a73a57f5e0d1fe3bea5f764d";

export const medusa = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  publishableApiKey: MEDUSA_PUBLISHABLE_KEY,
  maxRetries: 3,
});

// Lightweight types for frontend usage
export type Cart = any;
export type LineItem = any;
export type Product = any;
export type Region = any;
export type ProductVariant = any;
export type PricedProduct = any;
export type PricedVariant = any;

// Test connection and log available products
medusa.products
  .list()
  .then(({ products }) => {
    // Medusa connected successfully
  })
  .catch((error) => {
    console.error("Failed to connect to Medusa backend:", error);
  });
