import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { SearchOverlay } from "./search/SearchOverlay";
import { UserMenu } from "./user/UserMenu";
import CartDrawer from "./CartDrawer";
import { useCart } from "@/contexts/CartContext";

export function Header() {
  const [hasScrolled, setHasScrolled] = React.useState(false);
  const { cart } = useCart();

  const itemCount =
    cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  React.useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-700 ease-out
        ${
          hasScrolled
            ? "bg-background/70 backdrop-blur-[20px] border-b border-border/10 shadow-lg"
            : "bg-transparent"
        }`}
    >
      <nav className="w-full h-full px-6 md:px-12 flex items-center justify-between">
        {/* Left Section - Logo */}
  <div className="flex items-center gap-4 md:gap-16"> {/* responsive gap to avoid overflow on small screens */}
          {/* Mobile Nav toggle */}
          <div className="lg:hidden">
            <MobileNav hasScrolled={hasScrolled} />
          </div>

          {/* Logo */}
          <Link to="/" className="block">
            <span
              className={`font-display font-extrabold tracking-[0.35em] uppercase transition-all duration-700 ease-out
                ${
                  hasScrolled
                    ? "text-2xl text-foreground"
                    : "text-3xl md:text-4xl text-primary"
                }`}
            >
              Amine
            </span>
          </Link>
        </div>

        {/* Center Section - Desktop Navigation */}
        <div className="hidden lg:flex flex-1 justify-center px-16"> {/* added padding to push nav away from logo */}
          <DesktopNav hasScrolled={hasScrolled} />
        </div>

        {/* Right Section - Actions (compact on small screens) */}
        <div className="flex items-center gap-3">
          <div className="p-0">
            <SearchOverlay />
          </div>
          <div className="p-0">
            <ThemeToggle />
          </div>
          <div className="p-0">
            <UserMenu />
          </div>

          {/* Cart */}
          <CartDrawer>
            <Button
              variant="ghost"
              size="icon"
              className={`relative h-8 w-8 md:h-10 md:w-10 p-0 flex items-center justify-center transition-all duration-500 
                ${hasScrolled ? 'text-foreground hover:bg-muted' : 'text-primary/80 hover:bg-white/10 hover:scale-110'}`}
            >
              <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
              {itemCount > 0 && (
                <Badge
                  className={`absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center transition-colors duration-500 
                    ${hasScrolled ? 'bg-foreground text-background' : 'bg-primary text-background'}`}
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
