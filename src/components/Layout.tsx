import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  isHomePage?: boolean;
}

export default function Layout({
  children,
  isHomePage = false
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Main Content */}
      <main className={`flex-1 ${!isHomePage ? 'pt-24' : ''}`}>
        {children}
      </main>

      <Footer />
    </div>
  );
}
