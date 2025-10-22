import * as React from "react";
import VideoHero from "@/components/VideoHero";
import ProductCarousel from "@/components/ProductCarousel";
import CollectionsShowcase from "@/components/CollectionsShowcase";
import PolarizedSlider from "@/components/PolarizedSlider";
import StorySection from "@/components/StorySection";
import ExploreBanner from "@/components/ExploreBanner";
import StoreLocator from "@/components/StoreLocator";
import Layout from "@/components/Layout";
import { SEO } from "@/components/SEO";

export default function Home() {
  // Memoized video URLs for the hero section
  const heroVideos = React.useMemo(
    () => [
      // "https://pub-9ea7b728635940dfbe7671f108d0a3aa.r2.dev/9872557-uhd_3840_2160_24fps%20(1).webm",
      "https://web-video-resource.gentlemonster.com/assets/video/ps/PS_main_landing_PC_1920x1080.mp4",
      "https://pub-9ea7b728635940dfbe7671f108d0a3aa.r2.dev/main_0_pc_1920_990.webm",
      "https://pub-9ea7b728635940dfbe7671f108d0a3aa.r2.dev/6118572-uhd_4096_2160_25fps.webm",
    ],
    [],
  );

  return (
    <Layout isHomePage={true}>
      <SEO
        title="Amine Eyewear - Premium Designer Sunglasses & Eyewear"
        description="Discover luxury eyewear from top brands: Ray-Ban, Gucci, Prada, Dior, Oakley. Free shipping on all orders. Shop polarized sunglasses, designer frames & optical glasses."
        url="https://lunette.amine.agency"
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Amine Eyewear",
          "url": "https://lunette.amine.agency",
          "logo": "https://lunette.amine.agency/image-Photoroom.png",
          "description": "Premium eyewear retailer offering designer sunglasses and optical frames",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "TN"
          }
        }}
      />
      {/* 🏞 Fullscreen Hero */}
      <div className="-mt-20">
        <VideoHero videos={heroVideos} />
      </div>

      {/* 🌿 Collections Showcase */}
      <CollectionsShowcase />

      {/* 🕶 Product Carousel */}
      <ProductCarousel />

      {/* 🔍 Polarized Vision Slider */}
      <PolarizedSlider imageUrl="https://images.pexels.com/photos/18232214/pexels-photo-18232214.jpeg" />

      {/* 📖 Story Section */}
      <StorySection />

      {/* 🌍 Explore Banner */}
      <ExploreBanner />

      {/* 🏬 Store Locator */}
      <StoreLocator />
    </Layout>
  );
}
