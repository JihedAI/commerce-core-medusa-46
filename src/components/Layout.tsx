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

// Types for navigation structure
interface NavigationChild {
  name: string;
  href: string;
}

interface NavigationItem {
  name: string;
  href: string;
  children?: NavigationChild[];
}

interface Navigation {
  name: string;
  href: string;
  hasDropdown?: boolean;
  hasUnderline?: boolean;
  items?: NavigationItem[];
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

  // Fetch categories using official Medusa documentation approach
  const { data: categoriesData = [] } = useQuery({
    queryKey: ["nav-categories"],
    queryFn: async () => {
      console.log('🔍 Starting category fetch using official Medusa approach...');
      try {
        // First, check what categories exist in backend
        console.log('📡 Checking all categories in backend...');
        const allCategoriesResponse = await sdk.store.category.list({
          limit: 100,
          fields: "id,name,handle,parent_category_id"
        });
        console.log('📋 All categories in backend:', allCategoriesResponse.product_categories);
        
        // Use the exact approach from Medusa docs
        console.log('📡 Fetching categories as hierarchy (official docs approach)...');
        const { product_categories } = await sdk.store.category.list({
          fields: "id,name,handle,category_children.id,category_children.name,category_children.handle",
          include_descendants_tree: true,
          parent_category_id: null,
        });
        
        console.log('✅ Categories fetched using official approach:', product_categories);
        console.log('📊 Total top-level categories:', product_categories?.length || 0);
        
        if (product_categories && product_categories.length > 0) {
          product_categories.forEach((cat, index) => {
            console.log(`📁 Category ${index + 1}:`, {
              id: cat.id,
              name: cat.name,
              handle: cat.handle,
              children_count: cat.category_children?.length || 0,
              children: cat.category_children?.map(child => ({
                name: child.name,
                handle: child.handle
              })) || []
            });
          });
        } else {
          console.log('⚠️ No top-level categories found with official approach');
          
          // Fallback: try getting all categories and filter manually
          console.log('🔄 Trying fallback approach...');
          const allCategories = allCategoriesResponse.product_categories || [];
          const topLevelCategories = allCategories.filter(cat => 
            !cat.parent_category_id || cat.parent_category_id === null
          );
          console.log('🔧 Manual filter found top-level categories:', topLevelCategories);
          
          if (topLevelCategories.length > 0) {
            // Fetch each top-level category with its children
            const categoriesWithChildren = await Promise.all(
              topLevelCategories.map(async (cat) => {
                try {
                  const response = await sdk.store.category.retrieve(cat.id, {
                    fields: "id,name,handle,category_children.id,category_children.name,category_children.handle",
                    include_descendants_tree: true,
                  });
                  return response.product_category;
                } catch (error) {
                  console.error(`Failed to fetch children for category ${cat.name}:`, error);
                  return cat;
                }
              })
            );
            console.log('🎯 Categories with children fetched:', categoriesWithChildren);
            return categoriesWithChildren;
          }
        }
        
        return product_categories || [];
      } catch (error) {
        console.error("❌ Failed to fetch categories:", error);
        console.error("Error details:", {
          message: error.message,
          status: error.status,
          response: error.response
        });
        return [];
      }
    },
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


  // Create navigation from categories with detailed logging
  console.log('🔧 Building navigation from categories data:', categoriesData);
  
  const categoryNavItems: Navigation[] = categoriesData.map(cat => {
    console.log('📝 Processing category for nav:', {
      name: cat.name,
      handle: cat.handle,
      children: cat.category_children?.length || 0
    });
    
    return {
      name: cat.name,
      href: `/categories/${cat.handle}`,
      hasDropdown: cat.category_children && cat.category_children.length > 0,
      items: cat.category_children && cat.category_children.length > 0 
        ? cat.category_children.map(child => ({
            name: child.name,
            href: `/categories/${child.handle}`
          }))
        : undefined
    };
  });
  
  console.log('🚀 Final category navigation items:', categoryNavItems);

  const navigation: Navigation[] = [
    ...categoryNavItems,
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
      {/* Debug Panel - Remove in production */}
      <div className="fixed top-20 right-4 z-50 bg-red-500/90 text-white p-4 rounded text-xs max-w-sm">
        <h3 className="font-bold mb-2">🐛 Debug Info</h3>
        <p>Categories loaded: {categoriesData.length}</p>
        <p>Category nav items: {categoryNavItems.length}</p>
        <p>Collections: {collectionsData.length}</p>
        {categoriesData.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer">Categories Detail</summary>
            <pre className="mt-1 text-xs overflow-auto max-h-32">
              {JSON.stringify(categoriesData.map(c => ({ name: c.name, handle: c.handle, children: c.category_children?.length })), null, 1)}
            </pre>
          </details>
        )}
      </div>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-700 ease-out ${
        hasScrolled 
          ? 'bg-background/70 backdrop-blur-[20px] border-b border-white/10 shadow-lg' 
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
                <SheetContent side="left" className="w-80 bg-background/95 backdrop-blur-md border-white/20">
                  <div className="flex flex-col gap-6 mt-8">
                    {navigation.map((item) => (
                      <div key={item.name} className="space-y-3">
                        <Link
                          to={item.href}
                          className="text-lg font-semibold text-foreground tracking-wide transition-colors hover:text-primary"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                        {item.hasDropdown && item.items && (
                          <div className="ml-4 space-y-2">
                            {item.items.map((subItem) => (
                              <div key={subItem.name} className="space-y-1">
                                <Link
                                  to={subItem.href}
                                  className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {subItem.name}
                                </Link>
                                {subItem.children && subItem.children.length > 0 && (
                                  <div className="ml-3 space-y-1">
                                    {subItem.children.map((child) => (
                                      <Link
                                        key={child.name}
                                        to={child.href}
                                        className="block text-xs text-foreground/60 hover:text-foreground transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                      >
                                        {child.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop Navigation */}
              <div className={`hidden lg:flex items-center transition-all duration-700 ease-out ${
                hasScrolled ? 'lg:gap-x-6' : 'lg:gap-x-8'
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
                          className={`font-medium text-xs tracking-[0.15em] uppercase transition-all duration-500 block py-2 ${
                            hasScrolled 
                              ? 'text-foreground hover:text-foreground/80' 
                              : 'text-primary/80 hover:text-primary'
                          }`}
                        >
                          {item.name}
                        </Link>
                        
                        {/* Enhanced Dropdown with Nested Categories */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out translate-y-[10px] group-hover:translate-y-0 z-50">
                          <div 
                            className="bg-background/95 backdrop-blur-[12px] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.4)] border border-white/10 w-[500px] py-4"
                            style={{ backdropFilter: 'blur(12px)' }}
                          >
                            <div className="grid grid-cols-2 gap-4 px-4">
                              {item.items?.map((subItem) => (
                                <div key={subItem.name} className="space-y-2">
                                  <Link
                                    to={subItem.href}
                                    className="block px-3 py-2 text-sm font-semibold text-foreground hover:text-primary hover:bg-white/10 rounded-lg transition-all duration-200"
                                    style={{ letterSpacing: '0.5px' }}
                                  >
                                    {subItem.name}
                                  </Link>
                                  {subItem.children && subItem.children.length > 0 && (
                                    <div className="space-y-1 ml-2">
                                      {subItem.children.map((child) => (
                                        <Link
                                          key={child.name}
                                          to={child.href}
                                          className="block px-3 py-1.5 text-xs text-foreground/70 hover:text-foreground hover:bg-white/5 rounded transition-all duration-200"
                                        >
                                          {child.name}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        className={`font-medium text-xs tracking-[0.15em] uppercase transition-all duration-500 relative group ${
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

            {/* Center Brand - Bigger and wider */}
            <Link 
              to="/" 
              className="absolute left-1/2 transform -translate-x-1/2 flex items-center transition-all duration-700 ease-out"
            >
              <span className={`font-display font-bold transition-all duration-700 ease-out tracking-[0.35em] uppercase ${
                hasScrolled 
                  ? 'text-2xl text-foreground' 
                  : 'text-5xl text-primary'
              }`}>
                Amine
              </span>
            </Link>

            {/* Right side actions - Far right */}
            <div className="flex items-center gap-5">
              {/* Enhanced Search */}
              <div className="flex items-center gap-3">
                {/* Cycling Search Phrases or Search Input */}
                {!searchExpanded ? (
                  <div className="hidden md:block overflow-hidden h-6 relative">
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
                      placeholder="Search for sunglasses…"
                      className={`w-64 h-8 text-sm transition-all duration-300 ease-out border-0 focus:ring-0 focus:border-0 focus:outline-none ${
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
                  className={`transition-all duration-500 ${
                    hasScrolled 
                      ? 'text-foreground hover:bg-muted' 
                      : 'text-primary/80 hover:bg-white/10 hover:scale-110'
                  }`}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

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
                  <DropdownMenuContent align="end" className="w-48 bg-background/90 backdrop-blur-[20px] border-white/20">
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="text-foreground hover:bg-white/10">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="text-foreground hover:bg-white/10">
                      Your Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/20" />
                    <DropdownMenuItem onClick={logout} className="text-foreground hover:bg-white/10">
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
                  <DropdownMenuContent align="end" className="w-48 bg-background/90 backdrop-blur-[20px] border-white/20">
                    <DropdownMenuItem onClick={() => navigate('/login')} className="text-foreground hover:bg-white/10">
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/register')} className="text-foreground hover:bg-white/10">
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