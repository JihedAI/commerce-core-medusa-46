import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { medusa } from '@/lib/medusa';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string;
  title: string;
  thumbnail: string;
  handle: string;
  price?: {
    formatted: string;
  };
}

export function SearchOverlay() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // 🧠 Example search phrases that rotate
  const exampleSearches = [
    'Ray-Ban ',
    'Oakley Holbrook',
    'Persol PO0649',
    'Gucci GG0061S',
    'Prada Linea',
    'Carrera Champion',
    'Maui Jim Red Sands',
    'Tom Ford Snowdon',
    'Versace VE4393',
    'Dior Blacktie 2.0'
  ];
  
  // ⏱ Rotate placeholder every 1.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % exampleSearches.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 🔍 Live search effect
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchProducts = async () => {
      setIsLoading(true);
      try {
        const { products } = await medusa.products.list({
          q: query,
          limit: 8
        });

        setResults(
          products.map(product => ({
            id: product.id,
            title: product.title,
            thumbnail: product.thumbnail || '',
            handle: product.handle,
            price: {
              formatted: product.variants[0]?.prices[0]?.amount
                ? (product.variants[0].prices[0].amount / 100).toLocaleString('en-US', {
                    style: 'currency',
                    currency: product.variants[0].prices[0].currency_code
                  })
                : 'N/A'
            }
          }))
        );
      } catch (error) {
        console.error('Error searching products:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      {/* Minimal input */}
      <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-background/60 border border-border/60 shadow-sm">
        <Search className="w-4 h-4 text-muted-foreground" />

        {/* 🌈 Animated placeholder wrapper */}
        <div className="relative flex-1 overflow-hidden">
          <Input
            type="search"
            className="border-0 focus-visible:ring-0 text-sm md:text-base flex-1 placeholder-transparent bg-transparent"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {!query && (
            <div className="absolute left-0 top-0 h-full flex items-center text-muted-foreground pointer-events-none">
              <div className="relative h-[1.5em] overflow-hidden">
                <AnimatePresence mode="wait">
                <motion.span
  key={placeholderIndex}
  initial={{ y: '100%', opacity: 0 }}
  animate={{ y: '0%', opacity: 1 }}
  exit={{ y: '-100%', opacity: 0 }}
  transition={{ duration: 0.5, ease: 'easeInOut' }}
  className="block whitespace-nowrap text-xs md:text-sm text-muted-foreground"
>
  {exampleSearches[placeholderIndex]}
</motion.span>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground"
            onClick={() => setQuery('')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Results dropdown */}
{query && (
  <div className="absolute left-0 right-0 mt-2 z-50">
    <div className="rounded-lg border border-border/60 bg-card/95 backdrop-blur shadow-md">
      <ScrollArea className="max-h-[60vh]">
        {isLoading ? (
          <div className="p-3 text-center text-xs text-muted-foreground">Chargement...</div>
        ) : results.length > 0 ? (
          <div className="grid gap-1.5 p-2">
            {results.map(result => (
              <Link
                key={result.id}
                to={"/products/" + result.handle}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/60 transition-colors"
              >
                <img
                  src={result.thumbnail || '/placeholder.svg'}
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
          <div className="p-3 text-center text-xs text-muted-foreground">
            Aucun produit trouvé
          </div>
        )}
      </ScrollArea>
    </div>
  </div>
)}

    </div>
  );
}
