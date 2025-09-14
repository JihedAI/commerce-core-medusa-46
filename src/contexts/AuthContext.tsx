import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sdk, type Customer } from '@/lib/sdk';

/**
 * AuthContext - Manages authentication state across the application
 * Stores customer data and provides auth-related functions
 */

interface AuthContextType {
  customer: Customer | null;
  setCustomer: (customer: Customer | null) => void;
  isLoading: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check if user is authenticated on mount
   * The SDK automatically includes JWT token if present
   */
  const checkAuth = async () => {
    try {
      // Try to retrieve customer with existing JWT token
      const { customer } = await sdk.store.customer.retrieve();
      if (customer) {
        setCustomer({
          id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: customer.phone,
          company_name: customer.company_name,
          created_at: typeof customer.created_at === 'string' ? customer.created_at : customer.created_at.toISOString(),
          updated_at: typeof customer.updated_at === 'string' ? customer.updated_at : customer.updated_at.toISOString(),
        });
      }
    } catch (error) {
      // Not logged in or token expired
      console.log('No active session');
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout function - clears JWT token and customer data
   */
  const logout = async () => {
    try {
      // The SDK should handle token removal
      // Clear the JWT token from localStorage
      localStorage.removeItem('medusa_jwt_token');
      setCustomer(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    customer,
    setCustomer,
    isLoading,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use auth context
 * Throws error if used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}