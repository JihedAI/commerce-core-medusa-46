import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sdk, type Customer } from '@/lib/sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight} from 'lucide-react';
import Layout from './Layout';

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
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState<string | null>(null);

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
        title: t('toast.loginSuccess', { defaultValue: 'Login successful!' }),
        description: t('toast.welcomeBack', { defaultValue: `Welcome back, ${customer.first_name}!` }),
        variant: 'success'
      });

      // Redirect to home or previous page
      navigate('/');
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error?.status === 401) {
        toast({
          title: t('toast.loginError', { defaultValue: 'Login failed' }),
          description: t('toast.invalidCredentials', { defaultValue: 'Invalid email or password. Please try again.' }),
          variant: 'destructive'
        });
      } else if (error?.status === 404) {
        toast({
          title: t('toast.loginError', { defaultValue: 'Login failed' }),
          description: t('toast.accountNotFound', { defaultValue: 'Account not found. Please register first.' }),
          variant: 'destructive'
        });
      } else {
        toast({
          title: t('toast.loginError', { defaultValue: 'Login failed' }),
          description: error?.message || t('toast.tryAgain', { defaultValue: 'Please try again.' }),
          variant: 'destructive'
        });
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
          title: t('toast.authFailed', { defaultValue: 'Authentication failed' }),
          description: t('toast.googleError', { defaultValue: 'Unable to connect to Google. Please try again.' }),
          variant: 'destructive',
        });
        return;
      }
      
      // Customer was previously authenticated
      const { customer } = await sdk.store.customer.retrieve();
      setCustomer(customer as Customer);
      
      toast({
        title: t('toast.loginSuccess', { defaultValue: 'Login successful!' }),
        description: t('toast.welcomeBack', { defaultValue: `Welcome back, ${customer.first_name}!` }),
        variant: 'success'
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({
        title: t('toast.googleLoginFailed', { defaultValue: 'Google login failed' }),
        description: error?.message || t('toast.tryAgain', { defaultValue: 'Please try again.' }),
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4 mt-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-center mb-8"
          >
            {/* <Link to="/" className="inline-block mb-6">
              <span className="font-display font-extrabold tracking-[0.35em] uppercase text-3xl text-primary">
                Amine
              </span>
            </Link> */}
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('auth.welcomeBack', { defaultValue: 'Welcome Back' })}
            </h1>
            <p className="text-muted-foreground">
              {t('auth.loginSubtitle', { defaultValue: 'Sign in to your account to continue' })}
            </p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <Card className="border-0 shadow-2xl bg-background/80 backdrop-blur-xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                      {t('auth.email', { defaultValue: 'Email Address' })}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('auth.emailPlaceholder', { defaultValue: 'Enter your email' })}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setIsFocused('email')}
                        onBlur={() => setIsFocused(null)}
                        className={`pl-10 h-12 border-2 transition-all duration-200 ${
                          isFocused === 'email' 
                            ? 'border-primary shadow-lg shadow-primary/20' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        disabled={isLoading}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                      {t('auth.password', { defaultValue: 'Password' })}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t('auth.passwordPlaceholder', { defaultValue: 'Enter your password' })}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setIsFocused('password')}
                        onBlur={() => setIsFocused(null)}
                        className={`pl-10 pr-10 h-12 border-2 transition-all duration-200 ${
                          isFocused === 'password' 
                            ? 'border-primary shadow-lg shadow-primary/20' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        disabled={isLoading}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/25"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          <span>{t('auth.signingIn', { defaultValue: 'Signing in...' })}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>{t('auth.signIn', { defaultValue: 'Sign In' })}</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Divider */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="relative my-6"
                >
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-3 text-muted-foreground font-medium">
                      {t('auth.orContinueWith', { defaultValue: 'Or continue with' })}
                    </span>
                  </div>
                </motion.div>

                {/* Google Login */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-2 hover:bg-muted/50 transition-all duration-300 transform hover:scale-[1.02]"
                    onClick={loginWithGoogle}
                    disabled={isLoading}
                  >
                    <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24">
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
                    {t('auth.continueWithGoogle', { defaultValue: 'Continue with Google' })}
                  </Button>
                </motion.div>

                {/* Register Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="text-center mt-6"
                >
                  <p className="text-sm text-muted-foreground">
                    {t('auth.noAccount', { defaultValue: "Don't have an account?"})}{" "}
                    <Link 
                      to="/register" 
                      className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline"
                    >
                      {t('auth.signUp', { defaultValue: 'Sign up' })}
                    </Link>
                  </p>
                </motion.div>
              </CardContent>
            </Card>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-primary/30 rounded-full blur-lg" />
          </motion.div>

          {/* Features */}
          
        </motion.div>
      </div>
    </Layout>
  );
}