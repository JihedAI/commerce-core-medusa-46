import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

export function SearchOverlay() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

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
          placeholder="Search products..."
          className="border-0 focus-visible:ring-0 text-sm bg-transparent h-7 placeholder:text-muted-foreground/60"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
    </form>
  );
}
