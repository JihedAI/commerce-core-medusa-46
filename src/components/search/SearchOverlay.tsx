import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

const PLACEHOLDER_TEXTS = [
  'Search for sneakers...',
  'Search for jackets...',
  'Search for accessories...',
  'Search for hoodies...',
  'Search for jeans...'
];

export function SearchOverlay() {
  const [query, setQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-background/40 backdrop-blur-sm border border-border/40 hover:border-border/60 transition-all duration-300">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={PLACEHOLDER_TEXTS[placeholderIndex]}
          className="border-0 focus-visible:ring-0 text-sm bg-transparent h-7 placeholder:text-muted-foreground/60 transition-all duration-500"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
    </form>
  );
}
