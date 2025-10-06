import Medusa from "@medusajs/medusa-js";

// Initialize Medusa SDK with backend configuration
export const medusa = new Medusa({
  baseUrl: "https://856jmnth-9000.euw.devtunnels.ms/",
  publishableApiKey: "pk_2b9991990a689e3d826f8592c9eb8038ce61fab352c5bcd9aead2cfd097da60d",
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
medusa.products.list()
  .then(({ products }) => {
    // Medusa connected successfully
  })
  .catch((error) => {
    console.error("Failed to connect to Medusa backend:", error);
  });