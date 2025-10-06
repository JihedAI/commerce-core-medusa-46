import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { medusa } from "@/lib/medusa";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ScrollArea } from "../ui/scroll-area";

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

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % exampleSearches.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchProducts = async () => {
      setIsLoading(true);
      try {
        const { products } = await medusa.products.list({ q: query, limit: 8 });
        setResults(
          products.map((product) => ({
            id: product.id,
            title: product.title,
            thumbnail: product.thumbnail || "",
            handle: product.handle,
            price: {
              formatted: product.variants[0]?.prices[0]?.amount
                ? (product.variants[0].prices[0].amount / 100).toLocaleString("en-US", {
                    style: "currency",
                    currency: product.variants[0].prices[0].currency_code || "USD",
                  })
                : "N/A",
            },
          })),
        );
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 400);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="relative flex items-center justify-end w-full max-w-md">
      {/* 🪄 Idle state: rotating keywords + search icon */}
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-end gap-3 cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <motion.div
              key={placeholderIndex}
              className="text-sm text-muted-foreground truncate"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {exampleSearches[placeholderIndex]}
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-accent/60 hover:bg-accent shadow-sm"
            >
              <Search className="w-4 h-4 text-foreground" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧠 Active state: input field with close */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="search"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute right-0 top-0 flex items-center gap-2 bg-background/70 border border-border rounded-full px-3 py-2 backdrop-blur-md shadow-sm"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="border-none bg-transparent focus-visible:ring-0 text-sm md:text-base"
            />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔽 Elegant results dropdown */}
      {isOpen && query && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="absolute right-0 top-12 w-full z-50"
        >
          <div className="rounded-lg border border-border/60 bg-card/95 backdrop-blur shadow-md overflow-hidden">
            <ScrollArea className="max-h-[60vh]">
              {isLoading ? (
                <div className="p-3 text-center text-xs text-muted-foreground">Loading...</div>
              ) : results.length > 0 ? (
                <div className="grid gap-1.5 p-2">
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      to={"/products/" + result.handle}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/60 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <img
                        src={result.thumbnail || "/placeholder.svg"}
                        alt={result.title}
                        className="w-10 h-10 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{result.title}</h4>
                        <p className="text-xs text-muted-foreground">{result.price?.formatted}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-muted-foreground">No results found</div>
              )}
            </ScrollArea>
          </div>
        </motion.div>
      )}
    </div>
  );
}
