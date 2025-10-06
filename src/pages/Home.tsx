import PolarizedSlider from "@/components/PolarizedSlider";

export default function Home() {
  const heroVideos = React.useMemo(() => [
    "https://pub-9ea7b728635940dfbe7671f108d0a3aa.r2.dev/9872557-uhd_3840_2160_24fps%20(1).webm",
    "https://pub-9ea7b728635940dfbe7671f108d0a3aa.r2.dev/main_0_pc_1920_990.webm", 
    "https://pub-9ea7b728635940dfbe7671f108d0a3aa.r2.dev/6118572-uhd_4096_2160_25fps.webm"
  ], []);

  return (
    <Layout isHomePage={true}>
      <div className="-mt-20">
        <VideoHero videos={heroVideos} />
      </div>
      <CollectionsShowcase />
      <ProductCarousel />
      <StorySection />

      {/* ✨ New Polarized Section */}
      <PolarizedSlider imageUrl="https://your-image-url-here.jpg" />

      <ExploreBanner />
      <StoreLocator />
    </Layout>
  );
}
