import { HttpTypes } from "@medusajs/types";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "react-jwt";
import { sdk, type Customer } from "@/lib/sdk";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { setCustomer } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomerState] = useState<HttpTypes.StoreCustomer>();
  const [error, setError] = useState<string | null>(null);

  const queryParams = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return Object.fromEntries(searchParams.entries());
  }, []);

  const sendCallback = async () => {
    let token = "";
    try {
      // Validate OAuth state parameter
      const savedState = sessionStorage.getItem('oauth_state');
      const receivedState = queryParams.state;
      
      if (!savedState || savedState !== receivedState) {
        throw new Error('Invalid OAuth state - possible CSRF attack');
      }
      
      // Clear the state after validation
      sessionStorage.removeItem('oauth_state');
      
      token = await sdk.auth.callback("customer", "google", queryParams);
    } catch (error: any) {
      // Only log in development
      if (import.meta.env.DEV) {
        console.error("Authentication callback failed:", { message: error?.message });
      }
      setError("Authentication Failed. Please try again.");
      throw error;
    }
    return token;
  };

  const createCustomer = async (email: string) => {
    try {
      // Create customer with email from OAuth identity
      const response = await sdk.store.customer.create({ email });
      
      if (import.meta.env.DEV) {
        console.log("Customer created successfully");
      }
      return response;
    } catch (error: any) {
      // Only log in development
      if (import.meta.env.DEV) {
        console.error("Failed to create customer:", { message: error?.message });
      }
      // Customer might already exist, continue anyway
      throw error;
    }
  };

  const refreshToken = async () => {
    await sdk.auth.refresh();
  };

  const validateCallback = async () => {
    try {
      if (import.meta.env.DEV) {
        console.log("Google Callback - Processing authentication");
      }
      
      const token = await sendCallback();
      
      // Check if we need to create a new customer
      const decodedToken = decodeToken(token) as { 
        actor_id: string; 
        auth_identity_id?: string;
        email?: string;
        app_metadata?: { 
          provider?: string;
          user_metadata?: { email?: string; name?: string } 
        }
      } | null;
      
      const shouldCreateCustomer = decodedToken?.actor_id === "" || decodedToken?.actor_id === undefined;
      
      if (shouldCreateCustomer) {
        try {
          // Extract email from token or use a placeholder
          const email = decodedToken?.email || 
                       decodedToken?.app_metadata?.user_metadata?.email || 
                       `oauth-${Date.now()}@placeholder.local`;
          await createCustomer(email);
          await refreshToken();
        } catch (createError: any) {
          // Only log in development
          if (import.meta.env.DEV) {
            console.error("Customer creation failed:", { message: createError?.message });
          }
          // Verify customer creation was necessary
          if (createError?.status !== 409) {
            throw createError;
          }
        }
      }
      
      // Retrieve customer data
      const { customer: customerData } = await sdk.store.customer.retrieve();
      
      setCustomerState(customerData);
      setCustomer(customerData as Customer);
      
      toast({
        title: "Login successful!",
        description: `Welcome, ${customerData.first_name || customerData.email}!`,
      });
      
      setLoading(false);
    } catch (error: any) {
      // Only log in development
      if (import.meta.env.DEV) {
        console.error("Callback validation error:", { message: error?.message });
      }
      setError(error?.message || "Authentication failed. Please try again.");
      setLoading(false);
      
      toast({
        title: "Authentication failed",
        description: "Unable to complete Google sign-in. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!loading && !error) return;
    validateCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!customer) return;
    // Redirect to homepage after successful authentication
    const timer = setTimeout(() => {
      navigate('/');
    }, 1500);
    return () => clearTimeout(timer);
  }, [customer, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="text-primary underline hover:no-underline"
            >
              Return to Login
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {loading ? "Authenticating..." : "Success!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {loading && (
            <>
              <LoadingSpinner size="lg" />
              <p className="text-muted-foreground">Completing Google sign-in...</p>
            </>
          )}
          {customer && (
            <>
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <p className="text-lg font-medium">
                Welcome, {customer.first_name || customer.email}!
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to homepage...
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

