import { ChefHat, Leaf, ShieldCheck, Truck } from "lucide-react";

const features = [
  { title: "100% Natural", icon: Leaf },
  { title: "Freshly Prepared", icon: ChefHat },
  { title: "Secure Payments", icon: ShieldCheck },
  { title: "Fast Delivery", icon: Truck },
];

type WhyChooseProps = {
  className?: string;
};

export default function WhyChoose({ className = "" }: WhyChooseProps) {
  return (
    <div className={`mx-auto max-w-7xl px-4 ${className}`}>
      <h3 className="text-lg font-semibold font-[Poppins] text-[#6A1B9A]">Why choose iBerryCart</h3>

      <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-4">
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
    </div>
  );
}
