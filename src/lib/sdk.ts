import Medusa from "@medusajs/js-sdk";

/**
 * Initialize Medusa SDK with JWT authentication
 * The SDK will automatically handle JWT tokens for authenticated requests
 */
export const sdk = new Medusa({
  baseUrl: "https://856jmnth-9000.euw.devtunnels.ms/",
  auth: {
    type: "jwt", // Use JWT authentication
    jwtTokenStorageKey: "medusa_jwt_token", // Key for storing JWT in localStorage
    jwtTokenStorageMethod: "local", // Store in localStorage
  },
  publishableKey: "pk_eb12150d81366c9ee8a4a554a34cdc20d575659998906f31aba17fa6bf918cb4",
});

// Export type for customer data
export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string;
  created_at: string;
  updated_at: string;
}

// Test SDK connection
sdk.store.product.list()
  .then(() => {
    console.log("Medusa SDK initialized successfully");
  })
  .catch((error) => {
    console.error("Failed to initialize Medusa SDK:", error);
  });

export default sdk;