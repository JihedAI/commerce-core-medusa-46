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
      token = await sdk.auth.callback("customer", "google", queryParams);
    } catch (error: any) {
      console.error("Authentication callback failed:", error);
      setError("Authentication Failed. Please try again.");
      throw error;
    }
    return token;
  };

  const createCustomer = async () => {
    try {
      // Backend should get email from Google auth identity
      // Use a placeholder that backend will replace
      const response = await sdk.store.customer.create({
        email: `temp-${Date.now()}@google-auth.temp`
      });
      console.log("✅ Customer created:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Failed to create customer:", error);
      // Customer might already exist, continue anyway
      throw error;
    }
  };

  const refreshToken = async () => {
    await sdk.auth.refresh();
  };

  const validateCallback = async () => {
    try {
      console.log("🔍 Google Callback - Query params:", queryParams);
      
      const token = await sendCallback();
      console.log("🔍 Received token:", token);
      
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
      
      console.log("🔍 Decoded token:", decodedToken);
      
      const shouldCreateCustomer = decodedToken?.actor_id === "" || decodedToken?.actor_id === undefined;
      console.log("🔍 Should create customer:", shouldCreateCustomer);
      
      if (shouldCreateCustomer) {
        console.log("✅ Creating customer (backend will populate from Google auth identity)");
        
        try {
          await createCustomer();
          console.log("✅ Customer creation successful, refreshing token");
          await refreshToken();
        } catch (createError: any) {
          console.error("❌ Customer creation failed:", createError);
          // Try to continue anyway - maybe customer already exists
        }
      }
      
      // Retrieve customer data
      const { customer: customerData } = await sdk.store.customer.retrieve();
      console.log("✅ Retrieved customer:", customerData);
      
      setCustomerState(customerData);
      setCustomer(customerData as Customer);
      
      toast({
        title: "Login successful!",
        description: `Welcome, ${customerData.first_name || customerData.email}!`,
      });
      
      setLoading(false);
    } catch (error: any) {
      console.error("❌ Callback validation error:", error);
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

