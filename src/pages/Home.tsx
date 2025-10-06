import * as React from "react";
import VideoHero from "@/components/VideoHero";
import ProductCarousel from "@/components/ProductCarousel";
import CollectionsShowcase from "@/components/CollectionsShowcase";
import StorySection from "@/components/StorySection";
import ExploreBanner from "@/components/ExploreBanner";
import StoreLocator from "@/components/StoreLocator";
import Layout from "@/components/Layout";
import PolarizedSlider from "@/components/PolarizedSlider";

export default function Home() {
  // Memoized video URLs for the hero section
  const heroVideos = React.useMemo(
    () => [
      "https://pub-9ea7b728635940dfbe7671f108d0a3aa.r2.dev/9872557-uhd_3840_2160_24fps%20(1).webm",
      "https://pub-9ea7b728635940dfbe7671f108d0a3aa.r2.dev/main_0_pc_1920_990.webm",
      "https://pub-9ea7b728635940dfbe7671f108d0a3aa.r2.dev/6118572-uhd_4096_2160_25fps.webm",
    ],
    []
  );

  return (
    <Layout isHomePage={true}>
      {/* 🏞 Fullscreen Hero */}
      <div className="-mt-20">
        <VideoHero videos={heroVideos} />
      </div>

      {/* 🌿 Collections Showcase */}
      <CollectionsShowcase />

      {/* 🕶 Product Carousel */}
      <ProductCarousel />

      {/* 📖 Story Section */}
      <StorySection />

      {/* ✨ Polarized Filter Comparison Section */}
      <PolarizedSlider imageUrl="https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1600&q=80" />

      {/* 🌍 Explore Banner */}
      <ExploreBanner />

      {/* 🏬 Store Locator */}
      <StoreLocator />
    </Layout>
  );
}
