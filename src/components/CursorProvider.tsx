import React, { createContext, useContext, useState, useEffect } from 'react';
import CustomCursor from './CustomCursor';

interface CursorContextType {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};

interface CursorProviderProps {
  children: React.ReactNode;
}

export const CursorProvider: React.FC<CursorProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if device supports hover (desktop)
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    const isDesktop = window.innerWidth >= 768;
    
    setIsVisible(supportsHover && isDesktop);

    // Listen for window resize to toggle cursor on mobile/desktop switch
    const handleResize = () => {
      const newSupportsHover = window.matchMedia('(hover: hover)').matches;
      const newIsDesktop = window.innerWidth >= 768;
      setIsVisible(newSupportsHover && newIsDesktop);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Apply global cursor styles
    if (isVisible) {
      document.body.style.cursor = 'none';
      document.documentElement.style.cursor = 'none';
      
      // Add style tag for global cursor hiding
      const style = document.createElement('style');
      style.id = 'custom-cursor-styles';
      style.textContent = `
        *, *::before, *::after {
          cursor: none !important;
        }
        
        input:focus,
        textarea:focus,
        [contenteditable="true"]:focus {
          cursor: text !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.body.style.cursor = '';
        document.documentElement.style.cursor = '';
        const existingStyle = document.getElementById('custom-cursor-styles');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [isVisible]);

  return (
    <CursorContext.Provider value={{ isVisible, setIsVisible }}>
      {children}
      {isVisible && <CustomCursor />}
    </CursorContext.Provider>
  );
};

export default CursorProvider;