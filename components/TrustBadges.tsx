import { Leaf, Sparkles } from "lucide-react";

const items = [
  { label: "100% Natural", Icon: Leaf },
  { label: "Freshly Prepared", Icon: Sparkles },
] as const;

export default function TrustBadges() {
  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="Product quality badges">
      {items.map(({ label, Icon }) => (
        <span
          key={label}
          role="listitem"
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/90 px-3 py-1 text-xs font-medium text-emerald-900"
        >
          <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-700" aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}
