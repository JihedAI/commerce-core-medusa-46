import Medusa from "@medusajs/js-sdk";

/**
 * Initialize Medusa SDK with JWT authentication
 * The SDK will automatically handle JWT tokens for authenticated requests
 */
export const sdk = new Medusa({
  baseUrl: "https://856jmnth-9000.euw.devtunnels.ms/app/",
  auth: {
    type: "jwt", // Use JWT authentication
    jwtTokenStorageKey: "medusa_jwt_token", // Key for storing JWT in localStorage
    jwtTokenStorageMethod: "local", // Store in localStorage
  },
  publishableKey: "pk_2b9991990a689e3d826f8592c9eb8038ce61fab352c5bcd9aead2cfd097da60d",
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
sdk.store.product
  .list()
  .then(() => {
    // Medusa SDK initialized successfully
  })
  .catch((error) => {
    console.error("Failed to initialize Medusa SDK:", error);
  });

export default sdk;
