import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { SearchOverlay } from "./search/SearchOverlay";
import { UserMenu } from "./user/UserMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import CartDrawer from "./CartDrawer";
import { useCart } from "@/contexts/CartContext";
import logo from "@/assets/logo.svg";

export function Header() {
  const [hasScrolled, setHasScrolled] = React.useState(false);
  const { cart } = useCart();
  const location = useLocation();

  const itemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  React.useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-700 ease-out ${
        hasScrolled ? "bg-background/70 backdrop-blur-[20px] border-b border-border/10 shadow-lg" : "bg-transparent"
      }`}
    >
      {/* ✅ Removed overflow-hidden to allow dropdowns to display properly */}
      <nav className="w-full h-full px-4 sm:px-8 md:px-10 lg:px-12 xl:px-16 flex items-center justify-between">
        {/* Left Section - Logo + Mobile Nav */}
        <div className="flex items-center gap-3 sm:gap-6 md:gap-8 lg:gap-12 min-w-0">
          {/* Mobile Nav toggle (shows up for tablet & mobile) */}
          <div className="xl:hidden">
            <MobileNav hasScrolled={hasScrolled} />
          </div>

          {/* Logo */}
          <Link to="/" className="block shrink-0">
            <img 
              src={logo} 
              alt="Amine Eyewear"
              className={`transition-all duration-700 ease-out ${
                hasScrolled ? "h-6 sm:h-8 w-auto" : "h-8 sm:h-10 md:h-14 w-auto"
              }`}
            />
          </Link>
        </div>

        {/* Center Section - Desktop Navigation */}
        {/* ✅ Hidden for tablet landscape too */}
        <div className="hidden xl:flex 2xl:flex flex-1 justify-center px-12">
          <DesktopNav hasScrolled={hasScrolled} />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {location.pathname !== "/products" && (
            <div className="hidden sm:block">
              <SearchOverlay />
            </div>
          )}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <ThemeToggle />
          <UserMenu />

          {/* Cart */}
          <CartDrawer>
            <Button
              variant="ghost"
              size="icon"
              className={`relative h-8 w-8 md:h-10 md:w-10 p-0 flex items-center justify-center transition-all duration-500 ${
                hasScrolled ? "text-foreground hover:bg-muted" : "text-primary/80 hover:bg-white/10 hover:scale-110"
              }`}
            >
              <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
              {itemCount > 0 && (
                <Badge
                  className={`absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center transition-colors duration-500 ${
                    hasScrolled ? "bg-foreground text-background" : "bg-primary text-background"
                  }`}
                >
                  {itemCount}
                </Badge>
              )}
            </Button>
          </CartDrawer>
        </div>
      </nav>
    </header>
  );
}
