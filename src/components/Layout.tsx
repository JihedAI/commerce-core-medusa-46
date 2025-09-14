import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, User, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import CartDrawer from "./CartDrawer";
import { Badge } from "@/components/ui/badge";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { cart } = useCart();
  const { customer, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [hasScrolled, setHasScrolled] = React.useState(false);

  const itemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  React.useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: "Sunglasses", href: "/categories" },
    { name: "Collections", href: "/collections" },
    { name: "Store", href: "/products" },
    { name: "Explore", href: "/products" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-500 ${
        hasScrolled 
          ? 'bg-background/80 backdrop-blur-[20px] border-b border-white/10' 
          : 'bg-transparent'
      }`}>
        <nav className="w-full h-full px-8">
          <div className="flex h-full items-center justify-between">
            {/* Left Navigation - Far left */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden mr-4">
                  <Button variant="ghost" size="icon" className={`transition-colors duration-300 ${
                    hasScrolled ? 'text-foreground hover:bg-muted' : 'text-primary hover:bg-white/10'
                  }`}>
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 bg-black/90 backdrop-blur-md border-white/20">
                  <div className="flex flex-col gap-6 mt-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="text-lg font-medium text-white tracking-wide transition-colors hover:text-white/80"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex lg:gap-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`font-medium text-xs tracking-[0.15em] uppercase transition-all duration-500 ${
                      hasScrolled 
                        ? 'text-foreground hover:text-foreground/80' 
                        : 'text-primary/80 hover:text-primary'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Center Brand - Bigger and wider */}
            <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
              <span className={`font-display font-bold transition-all duration-500 tracking-[0.35em] uppercase ${
                hasScrolled 
                  ? 'text-3xl text-foreground' 
                  : 'text-5xl text-primary'
              }`}>
                LUXE
              </span>
            </Link>

            {/* Right side actions - Far right */}
            <div className="flex items-center gap-5">
              {/* Search */}
              <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className={`transition-all duration-500 ${
                    hasScrolled 
                      ? 'text-foreground hover:bg-muted' 
                      : 'text-primary/80 hover:bg-white/10 hover:scale-110'
                  }`}>
                    <Search className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="h-auto bg-black/90 backdrop-blur-md border-white/20">
                  <div className="container mx-auto py-8">
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="text-lg h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      autoFocus
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Account */}
              {customer ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className={`transition-all duration-500 ${
                      hasScrolled 
                        ? 'text-foreground hover:bg-muted' 
                        : 'text-primary/80 hover:bg-white/10 hover:scale-110'
                    }`}>
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-black/90 backdrop-blur-md border-white/20">
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="text-white hover:bg-white/10">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="text-white hover:bg-white/10">
                      Your Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/20" />
                    <DropdownMenuItem onClick={logout} className="text-white hover:bg-white/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className={`transition-all duration-500 ${
                      hasScrolled 
                        ? 'text-foreground hover:bg-muted' 
                        : 'text-primary/80 hover:bg-white/10 hover:scale-110'
                    }`}>
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-black/90 backdrop-blur-md border-white/20">
                    <DropdownMenuItem onClick={() => navigate('/login')} className="text-white hover:bg-white/10">
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/register')} className="text-white hover:bg-white/10">
                      Create Account
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Cart */}
              <CartDrawer>
                <Button variant="ghost" size="icon" className={`relative transition-all duration-500 ${
                  hasScrolled 
                    ? 'text-foreground hover:bg-muted' 
                    : 'text-primary/80 hover:bg-white/10 hover:scale-110'
                }`}>
                  <ShoppingBag className="h-4 w-4" />
                  {itemCount > 0 && (
                    <Badge className={`absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center transition-colors duration-500 ${
                      hasScrolled 
                        ? 'bg-foreground text-background' 
                        : 'bg-primary text-background'
                    }`}>
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </CartDrawer>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-muted mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <span className="font-display font-bold text-xl">Modern Store</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Premium quality products with exceptional service.
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
                  <Link to="/categories" className="text-sm text-muted-foreground hover:text-foreground">
                    Sunglasses
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Shipping Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Returns & Exchanges
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="font-semibold mb-4">Stay Updated</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Subscribe to get special offers and new arrivals.
              </p>
              <div className="flex gap-2">
                <Input type="email" placeholder="Your email" className="flex-1" />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Modern Store. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}