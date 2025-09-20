import React from "react";
import VideoHero from "@/components/VideoHero";
import ProductCarousel from "@/components/ProductCarousel";
import CollectionsShowcase from "@/components/CollectionsShowcase";
import StorySection from "@/components/StorySection";
import ExploreBanner from "@/components/ExploreBanner";
import StoreLocator from "@/components/StoreLocator";
import Layout from "@/components/Layout";

export default function Home() {
  // Sample video URLs - replace with actual video content
  const heroVideos = [
    "https://www.pexels.com/download/video/9872557/",
    "https://cdn.pixabay.com/video/2025/01/21/253877_large.mp4", 
    "https://www.pexels.com/download/video/6118572/"
  ];

  return (
    <Layout isHomePage={true}>
      {/* Fullscreen Hero - offset negative margin to go under navbar */}
      <div className="-mt-20">
        <VideoHero videos={heroVideos} />
      </div>
      
      {/* Product Carousel Section */}
      <ProductCarousel />
      
      {/* Collections Showcase Section */}
      <CollectionsShowcase />
      
      {/* Story Section */}
      <StorySection />
      
      {/* Explore Banner Section */}
      <ExploreBanner />
      
      {/* Store Locator Section */}
      <StoreLocator />
    </Layout>
  );
}