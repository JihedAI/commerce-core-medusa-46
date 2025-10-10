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
      className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-700 ease-out
        ${
          hasScrolled ? "bg-background/70 backdrop-blur-[20px] border-b border-border/10 shadow-lg" : "bg-transparent"
        }`}
    >
      <nav className="w-full h-full px-4 sm:px-6 md:px-8 lg:px-12 flex items-center justify-between">
        {/* Left Section - Logo + Mobile Nav */}
        <div className="flex items-center gap-4 sm:gap-8 md:gap-12 lg:gap-16">
          {/* Mobile Nav toggle (visible below lg) */}
          <div className="block lg:hidden">
            <MobileNav hasScrolled={hasScrolled} />
          </div>

          {/* Logo */}
          <Link to="/" className="block">
            <span
              className={`font-display font-extrabold tracking-[0.25em] uppercase transition-all duration-700 ease-out
                ${
                  hasScrolled ? "text-xl sm:text-2xl text-foreground" : "text-2xl sm:text-3xl md:text-4xl text-primary"
                }`}
            >
              Amine
            </span>
          </Link>
        </div>

        {/* Center Section - Desktop/Tablet Navigation */}
        <div className="hidden md:flex flex-1 justify-center px-6 md:px-10 lg:px-16">
          <DesktopNav hasScrolled={hasScrolled} />
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Search (hidden only on very small screens) */}
          {location.pathname !== "/products" && (
            <div className="hidden sm:block">
              <SearchOverlay />
            </div>
          )}

          {/* Language switcher (hidden on xs only) */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {/* Theme + User */}
          <ThemeToggle />
          <UserMenu />

          {/* Cart */}
          <CartDrawer>
            <Button
              variant="ghost"
              size="icon"
              className={`relative h-8 w-8 md:h-10 md:w-10 p-0 flex items-center justify-center transition-all duration-500 
                ${
                  hasScrolled ? "text-foreground hover:bg-muted" : "text-primary/80 hover:bg-white/10 hover:scale-110"
                }`}
            >
              <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
              {itemCount > 0 && (
                <Badge
                  className={`absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center transition-colors duration-500 
                    ${hasScrolled ? "bg-foreground text-background" : "bg-primary text-background"}`}
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
