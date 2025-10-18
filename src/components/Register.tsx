import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { sdk, type Customer } from '@/lib/sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Sparkles, Shield, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import Layout from './Layout';

// Strong password validation schema
const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

/**
 * Register Component
 * Handles new customer registration with automatic login fallback
 */
export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCustomer } = useAuth();
  const { t } = useTranslation();
  
  // Form state using React hooks
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      toast({
        title: t('toast.validationError', { defaultValue: 'Validation Error' }),
        description: t('toast.passwordsDontMatch', { defaultValue: 'Passwords do not match' }),
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }

    // Validate password strength with zod
    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t('toast.validationError', { defaultValue: 'Weak Password' }),
          description: error.errors[0].message,
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }
    }

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
        title: t('toast.registerSuccess', { defaultValue: 'Registration successful!' }),
        description: t('toast.welcomeMessage', { defaultValue: 'Welcome to our store.' }),
        variant: 'success'
      });

      // Redirect to home or account page
      navigate('/');
      
    } catch (error: any) {
      // Only log in development
      if (import.meta.env.DEV) {
        console.error('Registration error:', { status: error?.status, message: error?.message });
      }
      
      // Handle specific error cases
      if (error?.status === 409) {
        toast({
          title: t('toast.registerError', { defaultValue: 'Registration failed' }),
          description: t('toast.emailAlreadyExists', { defaultValue: 'An account with this email already exists.' }),
          variant: 'destructive'
        });
      } else if (error?.status === 400) {
        toast({
          title: t('toast.registerError', { defaultValue: 'Registration failed' }),
          description: t('toast.invalidData', { defaultValue: 'Please check your information and try again.' }),
          variant: 'destructive'
        });
      } else {
        toast({
          title: t('toast.registerError', { defaultValue: 'Registration failed' }),
          description: error?.message || t('toast.tryAgain', { defaultValue: 'Please try again.' }),
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithGoogle = async () => {
    try {
      // Generate and store OAuth state for CSRF protection
      const state = crypto.randomUUID();
      sessionStorage.setItem('oauth_state', state);
      
      const result = await sdk.auth.login("customer", "google", {});
      
      if (typeof result === "object" && result.location) {
        // Append state parameter to OAuth URL
        const urlWithState = result.location.includes('?') 
          ? `${result.location}&state=${state}`
          : `${result.location}?state=${state}`;
        window.location.href = urlWithState;
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
        title: t('toast.registerSuccess', { defaultValue: 'Registration successful!' }),
        description: t('toast.welcomeMessage', { defaultValue: 'Welcome to our store.' }),
        variant: 'success'
      });
      
      navigate('/');
    } catch (error: any) {
      // Only log in development
      if (import.meta.env.DEV) {
        console.error('Google registration error:', { status: error?.status, message: error?.message });
      }
      toast({
        title: t('toast.googleRegisterFailed', { defaultValue: 'Google registration failed' }),
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
              {t('auth.createAccount', { defaultValue: 'Create Account' })}
            </h1>
            <p className="text-muted-foreground">
              {t('auth.registerSubtitle', { defaultValue: 'Join us and discover premium eyewear' })}
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
                  {/* Name Fields */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                        {t('auth.firstName', { defaultValue: 'First Name' })}
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder={t('auth.firstNamePlaceholder', { defaultValue: 'John' })}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          onFocus={() => setIsFocused('firstName')}
                          onBlur={() => setIsFocused(null)}
                          className={`pl-10 h-12 border-2 transition-all duration-200 ${
                            isFocused === 'firstName' 
                              ? 'border-primary shadow-lg shadow-primary/20' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                        {t('auth.lastName', { defaultValue: 'Last Name' })}
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="lastName"
                          type="text"
                          placeholder={t('auth.lastNamePlaceholder', { defaultValue: 'Doe' })}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          onFocus={() => setIsFocused('lastName')}
                          onBlur={() => setIsFocused(null)}
                          className={`pl-10 h-12 border-2 transition-all duration-200 ${
                            isFocused === 'lastName' 
                              ? 'border-primary shadow-lg shadow-primary/20' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
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
                        placeholder={t('auth.emailPlaceholder', { defaultValue: 'john@example.com' })}
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
                    transition={{ duration: 0.5, delay: 0.5 }}
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
                        placeholder={t('auth.passwordPlaceholder', { defaultValue: 'Create a password' })}
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
                        autoComplete="new-password"
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
                    {password && (
                      <div className="text-xs space-y-1">
                        <div className={`flex items-center space-x-1 ${password.length >= 12 ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {password.length >= 12 ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          <span>At least 12 characters</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {/[A-Z]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          <span>One uppercase letter</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {/[a-z]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          <span>One lowercase letter</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {/[0-9]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          <span>One number</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {/[^A-Za-z0-9]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          <span>One special character</span>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Confirm Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                      {t('auth.confirmPassword', { defaultValue: 'Confirm Password' })}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t('auth.confirmPasswordPlaceholder', { defaultValue: 'Confirm your password' })}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setIsFocused('confirmPassword')}
                        onBlur={() => setIsFocused(null)}
                        className={`pl-10 pr-10 h-12 border-2 transition-all duration-200 ${
                          isFocused === 'confirmPassword' 
                            ? 'border-primary shadow-lg shadow-primary/20' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        disabled={isLoading}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && password && (
                      <div className="text-xs">
                        {password === confirmPassword ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            <span>{t('auth.passwordsMatch', { defaultValue: 'Passwords match' })}</span>
                          </div>
                        ) : (
                          <span className="text-red-600">{t('auth.passwordsDontMatch', { defaultValue: 'Passwords do not match' })}</span>
                        )}
                      </div>
                    )}
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/25"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          <span>{t('auth.creatingAccount', { defaultValue: 'Creating account...' })}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>{t('auth.createAccount', { defaultValue: 'Create Account' })}</span>
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
                  transition={{ duration: 0.5, delay: 0.8 }}
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

                {/* Google Register */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-2 hover:bg-muted/50 transition-all duration-300 transform hover:scale-[1.02]"
                    onClick={registerWithGoogle}
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

                {/* Login Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                  className="text-center mt-6"
                >
                  <p className="text-sm text-muted-foreground">
                    {t('auth.alreadyHaveAccount', { defaultValue: 'Already have an account?'})}{" "}
                    <Link 
                      to="/login" 
                      className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline"
                    >
                      {t('auth.signIn', { defaultValue: 'Sign in' })}
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