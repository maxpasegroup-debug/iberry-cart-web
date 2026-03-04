import { Star } from "lucide-react";

type RatingStarsProps = {
  value: number;
};

export default function RatingStars({ value }: RatingStarsProps) {
  const rounded = Math.round(value);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => (
        <Star
          key={idx}
          size={14}
          className={idx < rounded ? "fill-amber-400 text-amber-400" : "text-gray-300"}
        />
      ))}
      <span className="text-xs text-gray-500">{value.toFixed(1)}</span>
    </div>
  );
}
