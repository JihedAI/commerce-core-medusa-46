import React, { Suspense } from "react";
import VideoHero from "@/components/VideoHero";
import Layout from "@/components/Layout";

// Lazy load components for better performance
const ProductCarousel = React.lazy(() => import("@/components/ProductCarousel"));
const CollectionsShowcase = React.lazy(() => import("@/components/CollectionsShowcase"));
const StorySection = React.lazy(() => import("@/components/StorySection"));
const ExploreBanner = React.lazy(() => import("@/components/ExploreBanner"));
const StoreLocator = React.lazy(() => import("@/components/StoreLocator"));

// Loading component
const SectionSkeleton = () => (
  <div className="w-full py-20 px-8 lg:px-16">
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-muted rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

export default function Home() {
  // Sample video URLs - replace with actual video content
  const heroVideos = [
    "https://pub-9ea7b728635940dfbe7671f108d0a3aa.r2.dev/9872557-uhd_3840_2160_24fps%20(1).webm",
    "https://pub-9ea7b728635940dfbe7671f108d0a3aa.r2.dev/253877_large.webm", 
    "https://pub-9ea7b728635940dfbe7671f108d0a3aa.r2.dev/6118572-uhd_4096_2160_25fps.webm"
  ];

  return (
    <Layout isHomePage={true}>
      {/* Fullscreen Hero - offset negative margin to go under navbar */}
      <div className="-mt-20">
        <VideoHero videos={heroVideos} />
      </div>
      
      {/* Product Carousel Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <ProductCarousel />
      </Suspense>
      
      {/* Collections Showcase Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <CollectionsShowcase />
      </Suspense>
      
      {/* Story Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <StorySection />
      </Suspense>
      
      {/* Explore Banner Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <ExploreBanner />
      </Suspense>
      
      {/* Store Locator Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <StoreLocator />
      </Suspense>
    </Layout>
  );
}