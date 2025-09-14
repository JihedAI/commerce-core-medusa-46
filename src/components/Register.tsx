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
 * Register Component
 * Handles new customer registration with automatic login fallback
 */
export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCustomer } = useAuth();
  
  // Form state using React hooks
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Step 1: Register the user with email/password auth
      await sdk.auth.register(
        "customer", // actor type
        "emailpass", // auth provider
        { 
          email, 
          password 
        }
      );

      // Step 2: Create the customer profile after successful registration
      const { customer } = await sdk.store.customer.create({
        first_name: firstName,
        last_name: lastName,
        email: email,
      });

      // Store customer in context
      setCustomer(customer as Customer);

      toast({
        title: "Registration successful!",
        description: "Welcome to our store.",
      });

      // Redirect to home or account page
      navigate('/');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // If customer already exists, try to login instead
      if (error?.message?.includes('already exists') || error?.status === 422) {
        try {
          // Fallback: Try to login with the same credentials
          await sdk.auth.login(
            "customer",
            "emailpass",
            { 
              email, 
              password 
            }
          );

          // Retrieve customer data after login
          const { customer } = await sdk.store.customer.retrieve();
          setCustomer(customer as Customer);

          toast({
            title: "Logged in successfully",
            description: "You already had an account, so we logged you in.",
          });

          navigate('/');
        } catch (loginError) {
          // Login also failed
          alert('Account exists but password is incorrect. Please login with correct password.');
        }
      } else {
        // Other registration errors
        alert(`Registration failed: ${error?.message || 'Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Register for a new account to start shopping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name Input */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="John"
                disabled={isLoading}
              />
            </div>

            {/* Last Name Input */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Doe"
                disabled={isLoading}
              />
            </div>

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
                minLength={8}
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </Button>

            {/* Login Link */}
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Button
                type="button"
                variant="link"
                className="p-0"
                onClick={() => navigate('/login')}
              >
                Login here
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
