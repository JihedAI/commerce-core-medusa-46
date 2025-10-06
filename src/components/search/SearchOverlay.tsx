import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { medusa } from "@/lib/medusa";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  title: string;
  thumbnail: string;
  handle: string;
  price?: { formatted: string };
}

export function SearchOverlay(): JSX.Element {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const debounceRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Rotate placeholders
  useEffect(() => {
    const t = window.setInterval(() => {
      setPlaceholderIndex((p) => (p + 1) % exampleSearches.length);
    }, 2500);
    return () => window.clearInterval(t);
  }, []);

  // Focus the input after opening
  useEffect(() => {
    if (open && inputRef.current) {
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        setQuery("");
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!open || !query.trim()) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    debounceRef.current = window.setTimeout(async () => {
      try {
        if (!medusa || typeof medusa.products?.list !== "function") {
          throw new Error("Search client not available");
        }

        const res: any = await medusa.products.list({ q: query, limit: 8 });
        const rawProducts = Array.isArray(res?.products) ? res.products : [];

        const mapped: SearchResult[] = rawProducts.map((p: any) => {
          const priceAmount = p?.variants?.[0]?.prices?.[0]?.amount;
          const currency = p?.variants?.[0]?.prices?.[0]?.currency_code ?? "USD";
          const formatted =
            typeof priceAmount === "number"
              ? (priceAmount / 100).toLocaleString("en-US", {
                  style: "currency",
                  currency,
                })
              : "N/A";

          return {
            id: p?.id ?? String(Math.random()),
            title: p?.title ?? "Untitled product",
            thumbnail: p?.thumbnail || "/placeholder.svg",
            handle: p?.handle ?? "",
            price: { formatted },
          };
        });

        setResults(mapped);
      } catch (err: any) {
        console.error("Search error:", err);
        setResults([]);
        setError(err?.message ?? "Search failed");
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, open]);

  return (
    <>
      {/* Search Trigger */}
      <div className="relative">
        <AnimatePresence>
          {!open && (
            <motion.button
              key="search-trigger"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 p-2 rounded-full bg-accent/60 hover:bg-accent transition-all shadow-sm"
              onClick={() => setOpen(true)}
              aria-label="Open search"
            >
              <Search className="w-4 h-4 text-foreground" />
              <motion.span
                key={placeholderIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground max-w-[10rem] truncate hidden sm:block"
              >
                {exampleSearches[placeholderIndex]}
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => {
              setOpen(false);
              setQuery("");
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
                {/* Search Header */}
                <div className="flex items-center gap-2 p-4 border-b">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                    placeholder="Search products, brands..."
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base"
                    aria-label="Search products"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Search Results */}
                {query.trim() && (
                  <div className="max-h-96 overflow-hidden">
                    <ScrollArea className="h-full">
                      {isLoading ? (
                        <div className="p-6 text-center text-muted-foreground">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mr-2" />
                          Searching...
                        </div>
                      ) : error ? (
                        <div className="p-6 text-center text-destructive">
                          <p>Error: {error}</p>
                          <Button variant="outline" className="mt-2" onClick={() => setQuery("")}>
                            Try Again
                          </Button>
                        </div>
                      ) : results.length > 0 ? (
                        <div className="p-2">
                          {results.map((result) => (
                            <Link
                              key={result.id}
                              to={`/products/${result.handle}`}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                              onClick={() => {
                                setOpen(false);
                                setQuery("");
                              }}
                            >
                              <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-md overflow-hidden">
                                <img src={result.thumbnail} alt={result.title} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{result.title}</h4>
                                <p className="text-sm text-muted-foreground">{result.price?.formatted}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-muted-foreground">No products found for "{query}"</div>
                      )}
                    </ScrollArea>
                  </div>
                )}

                {/* Search Tips */}
                {!query.trim() && (
                  <div className="p-6 text-center">
                    <p className="text-muted-foreground mb-4">Try searching for:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {exampleSearches.slice(0, 5).map((search, index) => (
                        <button
                          key={index}
                          className="px-3 py-1.5 text-sm bg-accent rounded-full hover:bg-accent/80 transition-colors"
                          onClick={() => setQuery(search)}
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
