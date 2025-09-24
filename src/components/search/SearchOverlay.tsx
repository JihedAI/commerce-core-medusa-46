import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { medusa } from '@/lib/medusa';

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
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    <>
      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10 rounded-full"
        onClick={() => setIsOpen(true)}
      >
        <Search className="w-5 h-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <div className="flex items-center gap-2 p-4 border-b">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for products..."
              className="border-0 focus-visible:ring-0 text-base"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <ScrollArea className="max-h-[60vh]">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : results.length > 0 ? (
              <div className="grid gap-4 p-4">
                {results.map(result => (
                  <Link
                    key={result.id}
                    to={"/products/" + result.handle}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <img
                      src={result.thumbnail || '/placeholder.svg'}
                      alt={result.title}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{result.title}</h4>
                      <p className="text-sm text-muted-foreground">{result.price?.formatted}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : query ? (
              <div className="p-4 text-center text-muted-foreground">
                No products found for "{query}"
              </div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}