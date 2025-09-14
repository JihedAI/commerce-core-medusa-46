import React from "react";
import VideoHero from "@/components/VideoHero";
import ProductCarousel from "@/components/ProductCarousel";
import Layout from "@/components/Layout";

export default function Home() {
  // Sample video URLs - replace with actual video content
  const heroVideos = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", 
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  ];

  return (
    <Layout>
      {/* Fullscreen Hero - offset negative margin to go under navbar */}
      <div className="-mt-20">
        <VideoHero videos={heroVideos} />
      </div>
      
      {/* Product Carousel Section */}
      <ProductCarousel />
    </Layout>
  );
}