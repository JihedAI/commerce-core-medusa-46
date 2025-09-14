import Medusa from "@medusajs/medusa-js";

// Initialize Medusa SDK with backend configuration
export const medusa = new Medusa({
  baseUrl: "https://856jmnth-9000.euw.devtunnels.ms/",
  publishableApiKey: "pk_ba00b69f3710729736480df4449027a7a43da5cc532f497b6f34a79c2f00ee3f",
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
    console.log("Medusa connected successfully. Available products:", products.length);
  })
  .catch((error) => {
    console.error("Failed to connect to Medusa backend:", error);
  });