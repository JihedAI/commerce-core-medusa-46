import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigationData } from '@/hooks/useNavigationData';

interface DesktopNavProps {
  hasScrolled: boolean;
}

export function DesktopNav({ hasScrolled }: DesktopNavProps) {
  const { navigation } = useNavigationData();

  return (
    <nav className="flex items-center justify-start w-full transition-all duration-700 ease-out">
      <div
        className={`flex items-center justify-start ${
          hasScrolled ? 'gap-x-6' : 'gap-x-8'
        }`}
      >
        {navigation.map((item) => (
          <div key={item.name} className="relative group">
            {/* Main category link */}
            <Link
              to={item.href}
              className={`
                relative font-medium text-xs tracking-[0.05em] uppercase transition-all duration-500 block py-1.5 whitespace-nowrap
                ${hasScrolled ? 'text-foreground' : 'text-primary/80'}
                after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-300
                hover:after:scale-x-100
              `}
            >
              {item.name}
            </Link>

            {/* Dropdown / Minimalist Menu */}
            {item.items && item.items.length > 0 && (
              <div
                className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 min-w-[260px] max-w-[640px] opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-50"
                role="menu"
                aria-label={`${item.name} menu`}
              >
                <div className="bg-background/95 border border-border/10 rounded-lg shadow-sm p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {item.items.map((subItem) => (
                      <div key={subItem.name} className="space-y-1">
                        <Link
                          to={subItem.href}
                          className="block text-sm font-semibold text-foreground hover:text-primary px-2 py-1 transition-colors"
                        >
                          {subItem.name}
                        </Link>
                        {subItem.children && subItem.children.length > 0 && (
                          <div className="ml-2 pl-2 border-l border-border/10 mt-1">
                            {subItem.children.map((child) => (
                              <Link
                                key={child.name}
                                to={child.href}
                                className="block text-xs text-foreground/70 hover:text-foreground px-2 py-1 transition-colors"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
