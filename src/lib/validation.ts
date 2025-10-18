import { z } from 'zod';

/**
 * Validation schemas for user input
 * Prevents XSS, SQL injection, and data corruption
 */

// Name validation - allows letters, spaces, hyphens, apostrophes
const nameRegex = /^[a-zA-Z\s'\-]+$/;

// Phone validation - international E.164 format
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

// Postal code validation - flexible for international formats
const postalCodeRegex = /^[A-Z0-9\s\-]{3,20}$/i;

export const checkoutSchema = z.object({
  email: z.string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  first_name: z.string()
    .trim()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters')
    .regex(nameRegex, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  last_name: z.string()
    .trim()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters')
    .regex(nameRegex, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  address_1: z.string()
    .trim()
    .min(1, 'Address is required')
    .max(255, 'Address must be less than 255 characters'),
  address_2: z.string()
    .max(255, 'Address line 2 must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  city: z.string()
    .trim()
    .min(1, 'City is required')
    .max(100, 'City name must be less than 100 characters'),
  province: z.string()
    .max(100, 'Province/State must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  postal_code: z.string()
    .trim()
    .min(3, 'Postal code must be at least 3 characters')
    .max(20, 'Postal code must be less than 20 characters')
    .regex(postalCodeRegex, 'Invalid postal code format'),
  phone: z.string()
    .trim()
    .regex(phoneRegex, 'Invalid phone number (use format: +1234567890)')
    .optional()
    .or(z.literal('')),
  country_code: z.string()
    .min(2, 'Country code required')
    .max(2, 'Country code must be 2 characters'),
});

export const profileSchema = z.object({
  first_name: z.string()
    .trim()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters')
    .regex(nameRegex, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  last_name: z.string()
    .trim()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters')
    .regex(nameRegex, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  phone: z.string()
    .trim()
    .regex(phoneRegex, 'Invalid phone number (use format: +1234567890)')
    .optional()
    .or(z.literal('')),
  company_name: z.string()
    .max(255, 'Company name must be less than 255 characters')
    .optional()
    .or(z.literal('')),
});

export const addressSchema = z.object({
  first_name: z.string()
    .trim()
    .max(100, 'First name must be less than 100 characters')
    .regex(nameRegex, 'First name can only contain letters, spaces, hyphens, and apostrophes')
    .optional()
    .or(z.literal('')),
  last_name: z.string()
    .trim()
    .max(100, 'Last name must be less than 100 characters')
    .regex(nameRegex, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .optional()
    .or(z.literal('')),
  company: z.string()
    .max(255, 'Company name must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  address_1: z.string()
    .trim()
    .min(1, 'Address is required')
    .max(255, 'Address must be less than 255 characters'),
  address_2: z.string()
    .max(255, 'Address line 2 must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  city: z.string()
    .trim()
    .min(1, 'City is required')
    .max(100, 'City name must be less than 100 characters'),
  province: z.string()
    .max(100, 'Province/State must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  postal_code: z.string()
    .trim()
    .min(3, 'Postal code must be at least 3 characters')
    .max(20, 'Postal code must be less than 20 characters')
    .regex(postalCodeRegex, 'Invalid postal code format'),
  phone: z.string()
    .trim()
    .regex(phoneRegex, 'Invalid phone number (use format: +1234567890)')
    .optional()
    .or(z.literal('')),
  country_code: z.string()
    .min(2, 'Country code required')
    .max(2, 'Country code must be 2 characters'),
});

export const promoCodeSchema = z.string()
  .trim()
  .toUpperCase()
  .min(3, 'Promo code must be at least 3 characters')
  .max(50, 'Promo code must be less than 50 characters')
  .regex(/^[A-Z0-9\-_]+$/, 'Promo code can only contain letters, numbers, hyphens, and underscores');
