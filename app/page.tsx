import BestSelling from "@/components/BestSelling";
import BottomNav from "@/components/BottomNav";
import CategoryScroll from "@/components/CategoryScroll";
import ComboPacks from "@/components/ComboPacks";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import LocationBar from "@/components/LocationBar";
import NewArrivals from "@/components/NewArrivals";
import SearchBar from "@/components/SearchBar";
import WhyChoose from "@/components/WhyChoose";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-0">
      <Header />
      <SearchBar />
      <LocationBar />
      <HeroSlider />
      <NewArrivals />
      <CategoryScroll />
      <ComboPacks />
      <WhyChoose />
      <BestSelling />
      <main className="mx-auto max-w-screen-md p-4 pt-6">
        <p className="text-sm text-[#6A1B9A]">Welcome to iBerryCart</p>
      </main>
      <BottomNav />
    </div>
  );
}
