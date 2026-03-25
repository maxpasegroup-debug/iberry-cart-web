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
      <div className="mx-auto max-w-7xl px-4">
        <SearchBar />
        <LocationBar />
      </div>

      <section className="py-6 md:py-10">
        <div className="mx-auto w-full max-w-7xl px-4">
          <HeroSlider />
        </div>
      </section>

      <section className="py-6 md:py-10">
        <NewArrivals />
      </section>

      <section className="py-6 md:py-10">
        <CategoryScroll />
      </section>

      <section className="py-6 md:py-10">
        <ComboPacks />
      </section>

      <section className="py-6 md:py-10">
        <WhyChoose />
      </section>

      <section className="py-6 md:py-10">
        <BestSelling />
      </section>

      <main className="mx-auto max-w-7xl px-4 pb-6">
        <p className="text-sm text-[#6A1B9A]">Welcome to iBerryCart</p>
      </main>
      <BottomNav />
    </div>
  );
}
