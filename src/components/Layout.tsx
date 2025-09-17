import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, User, Menu, LogOut, X } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";
import CartDrawer from "./CartDrawer";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";

interface LayoutProps {
  children: React.ReactNode;
  isHomePage?: boolean;
}

interface NavigationItem {
  name: string;
  href: string;
  hasDropdown?: boolean;
  hasUnderline?: boolean;
  items?: { name: string; href: string; }[];
}

export default function Layout({ children, isHomePage = false }: LayoutProps) {
  const { cart } = useCart();
  const { customer, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [fullSearchOpen, setFullSearchOpen] = React.useState(false);
  const [hasScrolled, setHasScrolled] = React.useState(false);
  const [currentSearchPhrase, setCurrentSearchPhrase] = React.useState(0);
  const [collections, setCollections] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);

  // Fetch categories with proper nested structure following Medusa best practices
  const { data: categoriesData = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["nav-categories"],
    queryFn: async () => {
      try {
        const { product_categories } = await sdk.store.category.list({
          // Only top-level categories
          parent_category_id: null,
          // Pull descendants so we can render dropdowns
          include_descendants_tree: true,
          // Keep payload light: top-level + children (id, name, handle)
          fields: "id,name,handle,category_children.id,category_children.name,category_children.handle,category_children.category_children.id,category_children.category_children.name,category_children.category_children.handle",
        });
        console.log('Categories with nested structure fetched:', product_categories);
        return product_categories || [];
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch collections using React Query like other components
  const { data: collectionsData = [] } = useQuery({
    queryKey: ["nav-collections"],
    queryFn: async () => {
      try {
        const { collections } = await sdk.store.collection.list({
          limit: 100,
          fields: "id,title,handle"
        });
        console.log('Collections fetched:', collections);
        return collections || [];
      } catch (error) {
        console.error("Failed to fetch collections:", error);
        return [
          { id: 'summer', title: 'Summer Shades', handle: 'summer-shades' },
          { id: 'luxury', title: 'Luxury Line', handle: 'luxury-line' },
          { id: 'limited', title: 'Limited Editions', handle: 'limited-editions' },
          { id: 'classic', title: 'Classic Collection', handle: 'classic' }
        ];
      }
    },
  });
  const [searchExpanded, setSearchExpanded] = React.useState(false);

  const itemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const popularSearchPhrases = ["Aviator", "Black Frames", "Summer Collection", "Ray-Ban", "Vintage Style"];

  React.useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSearchPhrase((prev) => (prev + 1) % popularSearchPhrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [popularSearchPhrases.length]);


  // Build navigation items dynamically from categories and collections
  const navigation: NavigationItem[] = [
    // Dynamic categories as top-level navigation items
    ...categoriesData.map(category => ({
      name: category.name,
      href: `/categories/${category.handle}`,
      hasDropdown: category.category_children && category.category_children.length > 0,
      items: category.category_children?.map(child => ({
        name: child.name,
        href: `/categories/${child.handle}`
      }))
    })),
    { 
      name: "Collections", 
      href: "/collections",
      hasDropdown: true,
      items: collectionsData.length > 0 ? collectionsData.map(col => ({ 
        name: col.title, // Collections use 'title' property, not 'name'
        href: `/collections/${col.handle}` 
      })) : [
        { name: 'Summer Shades', href: '/collections/summer-shades' },
        { name: 'Luxury Line', href: '/collections/luxury-line' },
        { name: 'Limited Editions', href: '/collections/limited-editions' },
        { name: 'Classic Collection', href: '/collections/classic' }
      ]
    },
    { name: "Store", href: "/products", hasUnderline: true },
    { name: "Explore", href: "/products", hasUnderline: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 h-16 sm:h-20 transition-all duration-700 ease-out safe-area-inset ${
        hasScrolled 
          ? 'bg-background/70 backdrop-blur-[20px] border-b border-white/10 shadow-lg' 
          : 'bg-transparent'
      }`}>
        <nav className="w-full h-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-full items-center justify-between">
            {/* Left Navigation - Far left */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden mr-2 sm:mr-4">
                  <Button variant="ghost" size="icon" className={`touch-target transition-colors duration-300 ${
                    hasScrolled ? 'text-foreground hover:bg-muted' : 'text-primary hover:bg-white/10'
                  }`}>
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 sm:w-80 bg-background/95 backdrop-blur-md border border-border safe-area-inset">
                  <div className="flex flex-col mt-8">
                    {/* Mobile Navigation Categories */}
                    {navigation.map((item) => (
                      <div key={item.name} className="border-b border-border/50 last:border-b-0">
                        <Link
                          to={item.href}
                          className="flex items-center justify-between py-4 px-2 text-lg font-medium text-foreground tracking-wide transition-colors hover:text-primary touch-target"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                        {/* Mobile Submenu */}
                        {item.hasDropdown && item.items && (
                          <div className="pb-4 border-t border-border/30">
                            {item.items.map((subItem) => (
                              <Link
                                key={subItem.name}
                                to={subItem.href}
                                className="block py-3 px-6 text-sm text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors touch-target"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Mobile-only quick links */}
                    <div className="mt-8 pt-6 border-t border-border">
                      {!customer ? (
                        <div className="flex flex-col gap-3">
                          <Link
                            to="/login"
                            className="flex items-center py-3 px-2 text-foreground hover:text-primary transition-colors touch-target"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Login
                          </Link>
                          <Link
                            to="/register"
                            className="flex items-center py-3 px-2 text-foreground hover:text-primary transition-colors touch-target"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Create Account
                          </Link>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <Link
                            to="/profile"
                            className="flex items-center py-3 px-2 text-foreground hover:text-primary transition-colors touch-target"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            My Profile
                          </Link>
                          <button
                            onClick={() => {
                              logout();
                              setMobileMenuOpen(false);
                            }}
                            className="flex items-center py-3 px-2 text-foreground hover:text-primary transition-colors touch-target text-left"
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop Navigation */}
              <div className={`hidden lg:flex items-center transition-all duration-700 ease-out ${
                hasScrolled ? 'lg:gap-x-4 xl:gap-x-6' : 'lg:gap-x-6 xl:gap-x-8'
              }`}>
                {navigation.map((item, index) => (
                  <div 
                    key={item.name} 
                    className="relative group"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animation: hasScrolled ? 'fade-in 0.6s ease-out forwards' : 'none'
                    }}
                  >
                    {item.hasDropdown ? (
                      <div className="relative">
                        <Link
                          to={item.href}
                          className={`font-medium text-xs xl:text-sm tracking-[0.1em] xl:tracking-[0.15em] uppercase transition-all duration-500 block py-2 touch-target ${
                            hasScrolled 
                              ? 'text-foreground hover:text-foreground/80' 
                              : 'text-primary/80 hover:text-primary'
                          }`}
                        >
                          {item.name}
                        </Link>
                        
                        {/* Dropdown */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out translate-y-[10px] group-hover:translate-y-0 z-50">
                          <div className="bg-background/95 backdrop-blur-[12px] rounded-lg shadow-xl border border-border w-72 xl:w-80 py-2">
                            {item.items?.map((subItem) => (
                              <Link
                                key={subItem.name}
                                to={subItem.href}
                                className="block px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-all duration-200 touch-target"
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        className={`font-medium text-xs xl:text-sm tracking-[0.1em] xl:tracking-[0.15em] uppercase transition-all duration-500 relative group touch-target ${
                          hasScrolled 
                            ? 'text-foreground hover:text-foreground/80' 
                            : 'text-primary/80 hover:text-primary'
                        } ${item.hasUnderline ? 'after:content-[""] after:absolute after:w-full after:h-0.5 after:bottom-0 after:left-0 after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100' : ''}`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Center Brand - Responsive sizing */}
            <Link 
              to="/" 
              className="absolute left-1/2 transform -translate-x-1/2 flex items-center transition-all duration-700 ease-out touch-target"
            >
              <span className={`font-display font-bold transition-all duration-700 ease-out tracking-[0.2em] sm:tracking-[0.25em] lg:tracking-[0.35em] uppercase ${
                hasScrolled 
                  ? 'text-lg sm:text-xl lg:text-2xl text-foreground' 
                  : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary'
              }`}>
                Amine
              </span>
            </Link>

            {/* Right side actions - Responsive spacing */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {/* Enhanced Search - Hidden on small screens, shown on medium+ */}
              <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                {/* Cycling Search Phrases or Search Input */}
                {!searchExpanded ? (
                  <div className="hidden lg:block overflow-hidden h-6 relative">
                    <div 
                      className={`transition-transform duration-500 ease-out ${
                        hasScrolled ? 'text-foreground/60' : 'text-primary/60'
                      }`}
                      style={{ 
                        transform: `translateY(-${currentSearchPhrase * 24}px)` 
                      }}
                    >
                      {popularSearchPhrases.map((phrase, index) => (
                        <div 
                          key={phrase} 
                          className="h-6 flex items-center text-xs font-light tracking-wide"
                        >
                          {phrase}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center transition-all duration-300 ease-out">
                    <Input
                      type="search"
                      placeholder="Search..."
                      className={`w-32 sm:w-48 lg:w-64 h-8 text-sm transition-all duration-300 ease-out border-0 focus:ring-0 focus:border-0 focus:outline-none ${
                        hasScrolled 
                          ? 'bg-background/50 text-foreground placeholder:text-foreground/60' 
                          : 'bg-white/10 text-primary placeholder:text-primary/60'
                      }`}
                      autoFocus
                    />
                  </div>
                )}

                {/* Search Icon */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    if (searchExpanded) {
                      setSearchExpanded(false);
                    } else {
                      setSearchExpanded(true);
                    }
                  }}
                  className={`touch-target transition-all duration-500 ${
                    hasScrolled 
                      ? 'text-foreground hover:bg-muted' 
                      : 'text-primary/80 hover:bg-white/10 hover:scale-110'
                  }`}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Search - Only visible on small screens */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setFullSearchOpen(true)}
                className={`sm:hidden touch-target transition-all duration-500 ${
                  hasScrolled 
                    ? 'text-foreground hover:bg-muted' 
                    : 'text-primary/80 hover:bg-white/10 hover:scale-110'
                }`}
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Full Search Overlay */}
              {fullSearchOpen && (
                <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm animate-fade-in">
                  <div className="flex items-center justify-center min-h-screen p-4">
                    <div className="w-full max-w-2xl bg-background/90 backdrop-blur-[20px] border border-white/20 rounded-sm shadow-xl p-8 animate-scale-in">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-medium text-foreground">Search</h2>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setFullSearchOpen(false)}
                          className="text-foreground/60 hover:text-foreground hover:bg-white/10"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      <Input
                        type="search"
                        placeholder="Search for sunglasses…"
                        className="text-lg h-12 bg-white/5 border-white/20 text-foreground placeholder:text-foreground/60 focus:border-primary"
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
               )}

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Account - Hidden on mobile, handled in mobile menu */}
              {customer ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className={`hidden sm:flex touch-target transition-all duration-500 ${
                      hasScrolled 
                        ? 'text-foreground hover:bg-muted' 
                        : 'text-primary/80 hover:bg-white/10 hover:scale-110'
                    }`}>
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-[20px] border border-border">
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="text-foreground hover:bg-muted/50 touch-target">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="text-foreground hover:bg-muted/50 touch-target">
                      Your Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={logout} className="text-foreground hover:bg-muted/50 touch-target">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className={`hidden sm:flex touch-target transition-all duration-500 ${
                      hasScrolled 
                        ? 'text-foreground hover:bg-muted' 
                        : 'text-primary/80 hover:bg-white/10 hover:scale-110'
                    }`}>
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-[20px] border border-border">
                    <DropdownMenuItem onClick={() => navigate('/login')} className="text-foreground hover:bg-muted/50 touch-target">
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/register')} className="text-foreground hover:bg-muted/50 touch-target">
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
      <main className={`flex-1 ${!isHomePage ? 'pt-24' : ''}`}>{children}</main>

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