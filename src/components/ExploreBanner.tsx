import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ExploreBanner() {
  const { t } = useTranslation();
  return (
    <section className="relative w-full h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/7335264/pexels-photo-7335264.jpeg"
          alt="Explore our eyewear collection"
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-8 lg:px-16">
          <div className="max-w-2xl space-y-8">
            {/* Main heading */}
            <div className="space-y-4">
              <div className="inline-block">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary bg-primary/10 px-4 py-2 rounded-full">
                  {t('explore.newCollection', { defaultValue: 'New Collection' })}
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-display font-bold text-foreground leading-tight">
                {t('explore.title1', { defaultValue: 'Explore' })}
                <span className="block text-primary">{t('explore.title2', { defaultValue: 'The Future' })}</span>
                <span className="block">{t('explore.title3', { defaultValue: 'Of Vision' })}</span>
              </h1>
            </div>
            
            {/* Description */}
            <p className="text-xl text-foreground/80 leading-relaxed max-w-lg">
              {t('explore.description', { defaultValue: 'Discover our cutting-edge eyewear collection where innovation meets style. Experience unparalleled comfort and crystal-clear vision with our latest designs.' })}
            </p>
            
            {/* Call to action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                to="/products"
                className="group bg-primary text-primary-foreground px-8 py-4 font-semibold tracking-wide hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 text-center"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>{t('hero.shopNow', { defaultValue: 'Shop Now' })}</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
              
              <Link 
                to="/collections"
                className="group border-2 border-foreground text-foreground px-8 py-4 font-semibold tracking-wide hover:bg-foreground hover:text-background transition-all duration-300 text-center"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>{t('explore.viewCollections', { defaultValue: 'View Collections' })}</span>
                  <svg className="w-5 h-5 transform group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </span>
              </Link>
            </div>
            
            {/* Features */}
            <div className="flex flex-wrap gap-6 pt-8 text-sm">
              <div className="flex items-center space-x-2 text-foreground/70">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>{t('explore.freeShipping', { defaultValue: 'Free Shipping' })}</span>
              </div>
              <div className="flex items-center space-x-2 text-foreground/70">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>{t('explore.returns', { defaultValue: '30-Day Returns' })}</span>
              </div>
              <div className="flex items-center space-x-2 text-foreground/70">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>{t('explore.warranty', { defaultValue: 'Lifetime Warranty' })}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center space-y-2 text-foreground/50">
            <span className="text-xs uppercase tracking-wide">Scroll</span>
            <div className="w-px h-8 bg-foreground/30 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}