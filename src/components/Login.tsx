import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sdk, type Customer } from '@/lib/sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Login Component
 * Handles customer authentication with email/password
 */
export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCustomer } = useAuth();
  
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

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Sign in to your account to continue shopping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Password</Label>
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
              {isLoading ? 'Signing In...' : 'Login'}
            </Button>

            {/* Register Link */}
            <div className="text-center text-sm">
              Don't have an account?{' '}
              <Button
                type="button"
                variant="link"
                className="p-0"
                onClick={() => navigate('/register')}
              >
                Register here
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
                Forgot password?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}