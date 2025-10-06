import { Link } from 'react-router-dom';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ShoppingBag } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="font-display font-bold text-xl">LUNETE</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Premium quality eyewear with exceptional service.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-sm text-muted-foreground hover:text-foreground">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/categories/sunglasses" className="text-sm text-muted-foreground hover:text-foreground">
                  Sunglasses
                </Link>
              </li>
              <li>
                <Link to="/categories/eyeglasses" className="text-sm text-muted-foreground hover:text-foreground">
                  Eyeglasses
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sm text-muted-foreground hover:text-foreground">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-muted-foreground hover:text-foreground">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get special offers and new arrivals.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="flex-1" 
                required
              />
              <Button type="submit">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} LUNETE. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}