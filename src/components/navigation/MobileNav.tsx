import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigationData } from '@/hooks/useNavigationData';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet';
import { ChevronRight, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  hasScrolled: boolean;
}

export function MobileNav({ hasScrolled }: MobileNavProps) {
  const { navigation } = useNavigationData();
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const handleBack = () => {
    if (activeSubCategory) {
      setActiveSubCategory(null);
    } else if (activeCategory) {
      setActiveCategory(null);
    }
  };

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'p-0 w-10 h-10 flex items-center justify-center transition-all duration-500',
              hasScrolled ? 'text-foreground' : 'text-primary'
            )}
          >
            <Menu size={24} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-full sm:max-w-lg">
          <SheetHeader className="border-b border-border/5 p-6">
            <Link to="/" onClick={() => setOpen(false)}>
              <h2 className="text-xl font-semibold">Navigation</h2>
            </Link>
          </SheetHeader>

          <div className="h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-background border-b border-border/5">
              {(activeCategory || activeSubCategory) && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 p-6 text-sm font-medium hover:text-primary transition-colors w-full"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span>Back to {activeSubCategory ? activeCategory : 'Menu'}</span>
                </button>
              )}
            </div>

                <div className="p-6">
              {activeCategory ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-border/10">
                    <button
                      onClick={handleBack}
                      className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/5"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <h3 className="text-xl font-semibold">{activeCategory}</h3>
                  </div>
                  <div className="space-y-6">
                    {navigation
                      .find(cat => cat.name === activeCategory)
                      ?.items?.map(subItem => (
                        <div key={subItem.name} className="space-y-3">
                          {subItem.children ? (
                            <>
                              <button
                                onClick={() => setActiveSubCategory(subItem.name)}
                                className="flex items-center justify-between w-full text-left px-4 py-2.5 rounded-lg hover:bg-white/5"
                              >
                                <span className="text-base font-medium">{subItem.name}</span>
                                <ChevronRight className="w-5 h-5 opacity-50" />
                              </button>
                              {activeSubCategory === subItem.name && (
                                <div className="ml-4 space-y-1 border-l border-border/10">
                                  {subItem.children.map(child => (
                                    <Link
                                      key={child.name}
                                      to={child.href}
                                      onClick={() => setOpen(false)}
                                      className="block text-sm text-foreground/70 hover:text-foreground hover:bg-white/5 px-4 py-2 rounded transition-colors"
                                    >
                                      {child.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <Link
                              to={subItem.href}
                              onClick={() => setOpen(false)}
                              className="block text-base font-medium hover:text-primary px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                            >
                              {subItem.name}
                            </Link>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {navigation.map(item => (
                    <div key={item.name} className="space-y-2">
                      {item.hasDropdown ? (
                        <div>
                          <button
                            onClick={() => setExpandedCategories(prev => ({ ...prev, [item.name]: !prev[item.name] }))}
                            className="flex items-center justify-between w-full text-left px-2 py-3 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <span className="text-xl font-medium">{item.name}</span>
                            <ChevronRight className={`w-5 h-5 transition-transform ${expandedCategories[item.name] ? 'rotate-90' : ''}`} />
                          </button>
                          {expandedCategories[item.name] && (
                            <div className="mt-2 pl-4 space-y-2">
                              {item.items?.map(sub => (
                                <div key={sub.name} className="space-y-1">
                                  <Link
                                    to={sub.href}
                                    onClick={() => setOpen(false)}
                                    className="block text-base font-medium hover:text-primary px-2 py-2 rounded transition-colors"
                                  >
                                    {sub.name}
                                  </Link>
                                  {sub.children && (
                                    <div className="pl-4 space-y-1 border-l border-border/10 mt-1">
                                      {sub.children.map(child => (
                                        <Link
                                          key={child.name}
                                          to={child.href}
                                          onClick={() => setOpen(false)}
                                          className="block text-sm text-foreground/70 hover:text-foreground px-2 py-1 rounded transition-colors"
                                        >
                                          {child.name}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          to={item.href}
                          onClick={() => setOpen(false)}
                          className="block text-xl font-medium hover:text-primary transition-colors"
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}