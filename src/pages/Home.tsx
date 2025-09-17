import React from "react";
import VideoHero from "@/components/VideoHero";
import ProductCarousel from "@/components/ProductCarousel";
import CollectionsShowcase from "@/components/CollectionsShowcase";
import StoreLocator from "@/components/StoreLocator";
import Layout from "@/components/Layout";

export default function Home() {
  // Sample video URLs - replace with actual video content
  const heroVideos = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", 
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  ];

  return (
    <Layout isHomePage={true}>
      {/* Fullscreen Hero - responsive offset for navbar */}
      <div className="-mt-16 sm:-mt-20">
        <VideoHero videos={heroVideos} />
      </div>
      
      {/* Product Carousel Section */}
      <ProductCarousel />
      
      {/* Collections Showcase Section */}
      <CollectionsShowcase />
      
      {/* Store Locator Section */}
      <StoreLocator />
    </Layout>
  );
}