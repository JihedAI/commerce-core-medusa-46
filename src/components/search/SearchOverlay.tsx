import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { medusa } from "@/lib/medusa";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  title: string;
  thumbnail: string;
  handle: string;
  price?: { formatted: string };
}

export function SearchOverlay() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const exampleSearches = [
    "Ray-Ban",
    "Oakley Holbrook",
    "Persol PO0649",
    "Gucci GG0061S",
    "Prada Linea",
    "Carrera Champion",
    "Maui Jim Red Sands",
    "Tom Ford Snowdon",
    "Versace VE4393",
    "Dior Blacktie 2.0",
  ];

  // rotate keywords
  useEffect(() => {
    const t = setInterval(() => {
      setPlaceholderIndex((p) => (p + 1) % exampleSearches.length);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  // focus the input when opened
  useEffect(() => {
    if (isOpen) {
      // small delay to let animation mount
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let mounted = true;
    const run = async () => {
      setIsLoading(true);
      try {
        const { products } = await medusa.products.list({ q: query, limit: 8 });
        if (!mounted) return;

        const mapped: SearchResult[] = (products || []).map((p: any) => {
          const priceAmount = p?.variants?.[0]?.prices?.[0]?.amount;
          const currency = p?.variants?.[0]?.prices?.[0]?.currency_code ?? "USD";
          const formatted = priceAmount
            ? (priceAmount / 100).toLocaleString("en-US", {
                style: "currency",
                currency,
              })
            : "N/A";

          return {
            id: p.id,
            title: p.title ?? "Untitled",
            thumbnail: p.thumbnail ?? "",
            handle: p.handle ?? "",
            price: { formatted },
          };
        });

        setResults(mapped);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    const debounce = setTimeout(run, 350);
    return () => {
      mounted = false;
      clearTimeout(debounce);
    };
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      {/* container stable — keep relative so dropdown can position */}
      <div className="flex items-center justify-end">
        {/* Idle: rotating keyword + search button */}
        <AnimatePresence mode="wait">
          {!isOpen && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
              className="flex items-center gap-3 cursor-default select-none"
            >
              <motion.span
                key={placeholderIndex}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="text-sm md:text-base text-muted-foreground max-w-[12rem] truncate"
                aria-hidden
              >
                {exampleSearches[placeholderIndex]}
              </motion.span>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  aria-label="Open search"
                  onClick={() => setIsOpen(true)}
                  className="p-2 rounded-full bg-accent/60 hover:bg-accent transition-shadow shadow-sm"
                >
                  <Search className="w-4 h-4 text-foreground" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active: input with icon + close */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="open"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.28 }}
              className="w-full flex items-center gap-2"
            >
              <div className="flex-1 relative">
                <div className="flex items-center gap-2 rounded-full px-3 py-2 bg-background/70 border border-border/60 shadow-sm">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products, brands..."
                    className="border-0 bg-transparent focus-visible:ring-0 text-sm md:text-base"
                    aria-label="Search query"
                  />
                </div>

                {/* results dropdown */}
                {query.trim() !== "" && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 right-0 mt-2 z-50"
                  >
                    <div className="rounded-lg border border-border/60 bg-card/95 backdrop-blur shadow-md overflow-hidden">
                      <ScrollArea className="max-h-[50vh]">
                        {isLoading ? (
                          <div className="p-3 text-center text-xs text-muted-foreground">Chargement...</div>
                        ) : results.length > 0 ? (
                          <div className="grid gap-1.5 p-2">
                            {results.map((r) => (
                              <Link
                                key={r.id}
                                to={"/products/" + r.handle}
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/60 transition-colors"
                                onClick={() => {
                                  setIsOpen(false);
                                  setQuery("");
                                }}
                              >
                                <img
                                  src={r.thumbnail || "/placeholder.svg"}
                                  alt={r.title}
                                  className="w-10 h-10 object-cover rounded-md"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium truncate">{r.title}</h4>
                                  <p className="text-xs text-muted-foreground">{r.price?.formatted}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 text-center text-xs text-muted-foreground">Aucun produit trouvé</div>
                        )}
                      </ScrollArea>
                    </div>
                  </motion.div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                aria-label="Close search"
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
                className="rounded-full"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
