import Medusa from "@medusajs/js-sdk";

/**
 * Initialize Medusa SDK with JWT authentication using environment variables
 * The SDK will automatically handle JWT tokens for authenticated requests
 */
const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || "https://api.amine.agency";
const MEDUSA_PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || "pk_4b2ca5103e173cdd941ec632e69148a9057c7ac2a73a57f5e0d1fe3bea5f764d";

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  auth: {
    type: "jwt", // Use JWT authentication
    jwtTokenStorageKey: "medusa_jwt_token", // Key for storing JWT in localStorage
    jwtTokenStorageMethod: "local", // Store in localStorage
  },
  publishableKey: MEDUSA_PUBLISHABLE_KEY,
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
