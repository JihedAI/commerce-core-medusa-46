import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sdk, type Customer } from '@/lib/sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Mail } from 'lucide-react';

/**
 * Login Component
 * Handles customer authentication with email/password
 */
export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCustomer } = useAuth();
  const { t } = useTranslation();
  
  // Form state using React hooks
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Step 1: Login with email/password
      const loginResponse = await sdk.auth.login(
        "customer", // actor type
        "emailpass", // auth provider
        { 
          email, 
          password 
        }
      );

      // Check if additional actions are required (e.g., MFA)
      if (typeof loginResponse === 'object' && 'location' in loginResponse) {
        alert('Additional authentication required. This feature is not yet implemented.');
        setIsLoading(false);
        return;
      }

      // Step 2: Retrieve the logged-in customer data
      const { customer } = await sdk.store.customer.retrieve();
      
      // Store customer in context
      setCustomer(customer as Customer);

      toast({
        title: "Login successful!",
        description: `Welcome back, ${customer.first_name}!`,
      });

      // Redirect to home or previous page
      navigate('/');
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error?.status === 401) {
        alert('Invalid email or password. Please try again.');
      } else if (error?.status === 404) {
        alert('Account not found. Please register first.');
      } else {
        alert(`Login failed: ${error?.message || 'Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await sdk.auth.login("customer", "google", {});
      
      if (typeof result === "object" && result.location) {
        // Redirect to Google for authentication
        window.location.href = result.location;
        return;
      }
      
      if (typeof result !== "string") {
        toast({
          title: "Authentication failed",
          description: "Unable to connect to Google. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Customer was previously authenticated
      const { customer } = await sdk.store.customer.retrieve();
      setCustomer(customer as Customer);
      
      toast({
        title: "Login successful!",
        description: `Welcome back, ${customer.first_name}!`,
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({
        title: "Google login failed",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.login')}</CardTitle>
          <CardDescription>
            {t('auth.loginDescription', { defaultValue: 'Sign in to your account to continue shopping' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="john@example.com"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? t('auth.loggingIn') : t('buttons.login')}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              OR
            </span>
          </div>

          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={loginWithGoogle}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t('auth.continueWithGoogle')}
          </Button>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm">
            {t('auth.noAccount')}{' '}
            <Button
              type="button"
              variant="link"
              className="p-0"
              onClick={() => navigate('/register')}
            >
              {t('auth.registerHere')}
            </Button>
          </div>

          {/* Forgot Password Link (optional) */}
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="text-sm text-muted-foreground"
              onClick={() => alert('Password reset not yet implemented')}
            >
              {t('auth.forgotPassword')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}