import { Leaf, ShieldCheck, Sparkles, Truck } from "lucide-react";

const features = [
  { title: "100% Natural", icon: Leaf },
  { title: "Premium Quality", icon: Sparkles },
  { title: "Secure Payments", icon: ShieldCheck },
  { title: "Fast Delivery", icon: Truck },
];

export default function WhyChoose() {
  return (
    <section className="lg:mx-auto lg:max-w-screen-xl">
      <h3 className="mx-4 mt-6 text-lg font-semibold font-[Poppins] text-[#6A1B9A] lg:mx-0 lg:mt-7">
        Why Choose iBerryCart
      </h3>

      <div className="mt-3 grid grid-cols-2 gap-4 px-4 lg:mx-0 lg:grid-cols-4 lg:px-0">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <article
              key={feature.title}
              className="rounded-xl bg-white p-4 shadow-sm"
            >
              <div className="flex justify-center">
                <Icon size={22} className="text-[#6A1B9A]" />
              </div>
              <p className="mt-3 text-center text-sm font-medium text-gray-700">
                {feature.title}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
