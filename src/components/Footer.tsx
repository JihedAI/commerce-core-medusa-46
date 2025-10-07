import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';
import { 
  Instagram, 
  Facebook, 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  ChevronRight,
  Eye,
  Heart,
  Shield,
  Truck
} from 'lucide-react';
import { scrollToTopEnhanced, scrollToCollections } from '@/utils/smoothScroll';

export function Footer() {
  const { t } = useTranslation();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      // Here you would typically send the email to your backend
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  // Handle smooth scrolling for navigation links
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, target: 'home' | 'collections') => {
    e.preventDefault();
    
    // Only smooth scroll if we're on the home page
    if (location.pathname === '/') {
      if (target === 'home') {
        scrollToTopEnhanced();
      } else if (target === 'collections') {
        scrollToCollections();
      }
    } else {
      // If not on home page, navigate to home first, then scroll
      if (target === 'home') {
        window.location.href = '/';
      } else if (target === 'collections') {
        window.location.href = '/#collections-section';
      }
    }
  };

  return (
    <footer className="bg-gradient-to-b from-background to-muted/50 border-t border-border/20">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 lg:px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logo */}
            <Link to="/" className="inline-block group">
              <span className="font-display font-extrabold tracking-[0.35em] uppercase text-3xl text-primary group-hover:text-primary/80 transition-colors duration-300">
                Amine
              </span>
            </Link>
            
            {/* Brand Description */}
            <p className="text-muted-foreground leading-relaxed max-w-md">
              {t('footer.about', { defaultValue: 'Crafting timeless eyewear that redefines your perspective. Premium quality, exceptional service, and designs that stand the test of time.' })}
            </p>

            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 group">
                <Phone className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
                <a 
                  href="tel:+21620313348" 
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  +216 20 313 348
                </a>
              </div>
              
              <div className="flex items-center space-x-3 group">
                <Mail className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
                <a 
                  href="mailto:saassouguimedamine@gmail.com" 
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  saassouguimedamine@gmail.com
                </a>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground tracking-wide">Follow Us</h4>
              <div className="flex space-x-4">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group p-2 rounded-full bg-muted hover:bg-primary/10 transition-all duration-300 hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group p-2 rounded-full bg-muted hover:bg-primary/10 transition-all duration-300 hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                </a>
                <a 
                  href="https://tiktok.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group p-2 rounded-full bg-muted hover:bg-primary/10 transition-all duration-300 hover:scale-110"
                  aria-label="TikTok"
                >
                  <svg className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-semibold text-foreground tracking-wide">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/" 
                  onClick={(e) => handleSmoothScroll(e, 'home')}
                  className="group flex items-center text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                  aria-label="Scroll to top of homepage"
                >
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  {t('nav.home', { defaultValue: 'Home' })}
                </a>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className="group flex items-center text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  {t('nav.products', { defaultValue: 'Products' })}
                </Link>
              </li>
              <li>
                <a 
                  href="/#collections-section" 
                  onClick={(e) => handleSmoothScroll(e, 'collections')}
                  className="group flex items-center text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                  aria-label="Scroll to collections section"
                >
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  {t('nav.collections', { defaultValue: 'Collections' })}
                </a>
              </li>
              <li>
                <Link 
                  to="/categories" 
                  className="group flex items-center text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  {t('nav.categories', { defaultValue: 'Categories' })}
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  className="group flex items-center text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  {t('nav.profile', { defaultValue: 'Profile' })}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-6">
            <h4 className="font-semibold text-foreground tracking-wide">Customer Care</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/contact" 
                  className="group flex items-center text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  {t('footer.contact', { defaultValue: 'Contact Us' })}
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="group flex items-center text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  {t('footer.shipping', { defaultValue: 'Shipping Info' })}
                </Link>
              </li>
              <li>
                <Link 
                  to="/returns" 
                  className="group flex items-center text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  {t('footer.returns', { defaultValue: 'Returns' })}
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="group flex items-center text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  {t('footer.faq', { defaultValue: 'FAQ' })}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="font-semibold text-foreground tracking-wide">Stay Updated</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('footer.newsletter', { defaultValue: 'Subscribe to our newsletter for exclusive offers, new arrivals, and style tips.' })}
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="relative">
                <Input 
                  type="email" 
                  placeholder={t('footer.enterEmail', { defaultValue: 'Enter your email' })}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-12 bg-background/50 border-border/30 focus:border-primary/50 transition-colors duration-200"
                  required
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="absolute right-1 top-1 h-8 w-8 p-0 bg-primary hover:bg-primary/90 transition-colors duration-200"
                  disabled={isSubscribed}
                >
                  {isSubscribed ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {isSubscribed && (
                <p className="text-sm text-primary font-medium">
                  {t('footer.subscribed', { defaultValue: 'Thank you for subscribing!' })}
                </p>
              )}
            </form>

            {/* Trust Signals */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>{t('footer.secure', { defaultValue: 'Secure & Private' })}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Truck className="h-3 w-3" />
                <span>{t('footer.freeShipping', { defaultValue: 'Free Shipping' })}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Heart className="h-3 w-3" />
                <span>{t('footer.lifetimeWarranty', { defaultValue: 'Lifetime Warranty' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/20 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-16 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} <span className="font-semibold text-primary">Amine</span>. {t('footer.copyright', { defaultValue: 'All rights reserved.' })}
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link 
                to="/privacy" 
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {t('footer.privacy', { defaultValue: 'Privacy Policy' })}
              </Link>
              <Link 
                to="/terms" 
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {t('footer.terms', { defaultValue: 'Terms of Service' })}
              </Link>
              <Link 
                to="/cookies" 
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {t('footer.cookies', { defaultValue: 'Cookie Policy' })}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}