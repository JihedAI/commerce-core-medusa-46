import { Link } from 'react-router-dom';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ShoppingBag, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-gradient-subtle border-t border-border/50">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary))_1px,transparent_1px)] bg-[length:24px_24px]" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section with Animated Logo */}
          <div className="col-span-1">
            <Link to="/" className="inline-flex items-center group mb-6">
              <div className="relative">
                <ShoppingBag className="h-8 w-8 text-primary transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <span className="ml-3 font-display font-bold text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                LUNETE
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Premium quality eyewear with exceptional service. Crafted for those who see style differently.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Twitter, href: '#' }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-muted hover:bg-primary group transition-all duration-300 flex items-center justify-center hover:shadow-glow"
                >
                  <social.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-6 relative inline-block">
              Shop
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-primary" />
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'All Products', to: '/products' },
                { label: 'Collections', to: '/collections' },
                { label: 'Sunglasses', to: '/categories/sunglasses' },
                { label: 'Eyeglasses', to: '/categories/eyeglasses' }
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 inline-flex items-center group"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-6 relative inline-block">
              Support
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-primary" />
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Contact Us', to: '/contact' },
                { label: 'Shipping Policy', to: '/shipping' },
                { label: 'Returns & Exchanges', to: '/returns' },
                { label: 'FAQs', to: '/faq' }
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 inline-flex items-center group"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>hello@lunete.tn</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+216 XX XXX XXX</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Tunis, Tunisia</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-6 relative inline-block">
              Stay Connected
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-primary" />
            </h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Subscribe to receive exclusive offers, style tips, and new arrivals directly in your inbox.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
              <div className="relative group">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="pr-12 bg-muted/50 border-border/50 focus:border-primary transition-all duration-300"
                  required
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} <span className="font-display">LUNETE</span>. Crafted with passion in Tunisia.
            </p>
            <div className="flex gap-6">
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </footer>
  );
}
