import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { medusa } from "@/lib/medusa";
import { motion, AnimatePresence } from "framer-motion";
interface SearchResult {
  id: string;
  title: string;
  thumbnail: string;
  handle: string;
}
export function SearchOverlay(): JSX.Element {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);
  const debounceRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const keywordsContainerRef = useRef<HTMLDivElement>(null);
  const exampleSearches = ["Ray-Ban", "Oakley Holbrook", "Persol PO0649", "Gucci GG0061S", "Prada Linea", "Carrera Champion", "Maui Jim Red Sands", "Tom Ford Snowdon", "Versace VE4393", "Dior Blacktie 2.0"];

  // Smooth scrolling animation for keywords
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKeywordIndex(prev => (prev + 1) % exampleSearches.length);
    }, 3000); // Changed to 3 seconds for better readability

    return () => clearInterval(interval);
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
        setOpen(v => !v);
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
        const res: any = await medusa.products.list({
          q: query,
          limit: 8
        });
        const rawProducts = Array.isArray(res?.products) ? res.products : [];
        const mapped: SearchResult[] = rawProducts.map((p: any) => ({
          id: p?.id ?? String(Math.random()),
          title: p?.title ?? "Untitled product",
          thumbnail: p?.thumbnail || "/placeholder.svg",
          handle: p?.handle ?? ""
        }));
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
  return <div className="relative">
      <Popover open={open} onOpenChange={v => {
      setOpen(v);
      if (!v) {
        setQuery("");
      }
    }}>
        <PopoverTrigger asChild>
            <motion.button key="search-trigger" initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} exit={{
          opacity: 0,
          scale: 0.9
        }} className="flex items-center gap-3 p-2 bg-transparent shadow-sm min-w-[200px] justify-start border-none hover:bg-accent/10 transition-all" aria-label="Open search">
              <Search className="w-4 h-4 text-foreground flex-shrink-0" />
              <div className="relative h-6 overflow-hidden flex-1 text-left">
                <motion.div key={currentKeywordIndex} initial={{
              y: 20,
              opacity: 0
            }} animate={{
              y: 0,
              opacity: 1
            }} exit={{
              y: -20,
              opacity: 0
            }} transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }} className="absolute inset-0 text-sm text-muted-foreground truncate">
                  {exampleSearches[currentKeywordIndex]}
                </motion.div>
              </div>
              
            </motion.button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={8} className="p-0 w-[min(90vw,40rem)] md:w-[36rem] max-h-[70vh] overflow-hidden shadow-xl rounded-none">
        <div className="bg-accent/10 border overflow-hidden">
        <div className="flex items-center gap-3 p-3 border-b-0 bg-transparent shadow-none">
                  <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <Input ref={inputRef} type="search" value={query} onChange={e => setQuery(e.target.value)} className="flex-1 text-sm md:text-base bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-none focus-visible:ring-0 focus-visible:border-none shadow-none placeholder:text-muted-foreground/70 placeholder:italic appearance-none" placeholder="Search products..." />
                  <Button variant="ghost" size="icon" onClick={() => {
              setOpen(false);
              setQuery("");
            }} className="rounded-full flex-shrink-0">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                {query.trim() && <div className="max-h-[55vh] overflow-hidden">
                    <ScrollArea className="h-full">
                      {isLoading ? <div className="p-8 text-center text-muted-foreground">
                          <div className="inline-flex items-center gap-3">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent" />
                            <span>Searching...</span>
                          </div>
                        </div> : error ? <div className="p-6 text-center text-destructive">
                          <p className="mb-3">Error: {error}</p>
                          <Button variant="outline" className="mt-2" onClick={() => setQuery("")}>
                            Try Again
                          </Button>
                        </div> : results.length > 0 ? <div className="p-2">
                          {results.map(result => <Link key={result.id} to={`/products/${result.handle}`} className="flex items-center gap-3 p-3 rounded-none hover:bg-accent/10 transition-colors group" onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}>
                              <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-md overflow-hidden">
                                <img src={result.thumbnail} alt={result.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate text-foreground group-hover:text-primary transition-colors">
                                  {result.title}
                                </h4>
                            {/* price removed from display as requested */}
                              </div>
                            </Link>)}
                        </div> : <div className="p-8 text-center text-muted-foreground">
                          <p>No products found for "{query}"</p>
                          <p className="text-sm mt-2">Try different keywords or check spelling</p>
                        </div>}
                    </ScrollArea>
                  </div>}
                {!query.trim() && <div className="p-4">
                <p className="text-muted-foreground mb-3 text-center">Try searching for:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {exampleSearches.slice(0, 6).map((search, index) => <motion.button key={search} initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: index * 0.1
              }} className="px-3 py-2 text-sm bg-transparent border-none hover:bg-accent/10 transition-all hover:scale-105 active:scale-95" onClick={() => setQuery(search)}>
                          {search}
                        </motion.button>)}
                    </div>
                  </div>}
              </div>
        </PopoverContent>
      </Popover>
    </div>;
}