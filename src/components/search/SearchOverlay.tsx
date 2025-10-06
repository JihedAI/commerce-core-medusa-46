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
  const inputId = "site-search-input"; // used to focus the input (safe even if Input doesn't forwardRef)

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

  // rotate placeholders
  useEffect(() => {
    const t = window.setInterval(() => {
      setPlaceholderIndex((p) => (p + 1) % exampleSearches.length);
    }, 2500);
    return () => window.clearInterval(t);
  }, []);

  // focus the input after opening (works even if your Input doesn't forwardRef)
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(inputId) as HTMLInputElement | null;
      el?.focus();
    }, 60);
    return () => window.clearTimeout(t);
  }, [open]);

  // keyboard shortcuts: Esc to close, Ctrl/Cmd+K to toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        setQuery("");
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setTimeout(() => document.getElementById(inputId)?.focus(), 60);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // debounced search (only when open && query)
  useEffect(() => {
    // clear previous debounce
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (!open || !query.trim()) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        // defensive: medusa might not be defined in some environments
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
            thumbnail: p?.thumbnail ?? "",
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
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [query, open]);

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center justify-end">
        {/* Idle: rotating keyword + search button */}
        <AnimatePresence>
          {!open && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24 }}
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => setOpen(true)}
              role="button"
              aria-label="Open search"
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
                  className="p-2 rounded-full bg-accent/60 hover:bg-accent transition-shadow shadow-sm"
                >
                  <Search className="w-4 h-4 text-foreground" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Open: input + close */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="open"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.22 }}
              className="w-full flex items-center gap-2"
            >
              <div className="flex-1 relative">
                <div className="flex items-center gap-2 rounded-full px-3 py-2 bg-background/70 border border-border/60 shadow-sm">
                  <Search className="w-4 h-4 text-muted-foreground" />

                  {/* Use your Input component but rely on id for focusing */}
                  <Input
                    id={inputId}
                    value={query}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                    placeholder="Search products, brands..."
                    className="border-0 bg-transparent focus-visible:ring-0 text-sm md:text-base"
                    aria-label="Search"
                  />

                  {query && (
                    <button onClick={() => setQuery("")} aria-label="Clear query" className="rounded-full p-1">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {/* Dropdown */}
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
                        ) : error ? (
                          <div className="p-3 text-center text-xs text-red-400">Erreur : {error}</div>
                        ) : results.length > 0 ? (
                          <div className="grid gap-1.5 p-2">
                            {results.map((r) => (
                              <Link
                                key={r.id}
                                to={"/products/" + r.handle}
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/60 transition-colors"
                                onClick={() => {
                                  setOpen(false);
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
                  setOpen(false);
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
