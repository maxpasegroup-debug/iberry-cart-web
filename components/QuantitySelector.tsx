"use client";

type QuantitySelectorProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
};

export default function QuantitySelector({ value, onChange, min = 1, max }: QuantitySelectorProps) {
  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <div className="inline-flex items-center rounded-full border border-gray-200 bg-white">
      <button
        type="button"
        className="px-3 py-1 text-lg text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={atMin}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className="min-w-8 text-center text-sm font-medium text-gray-700">{value}</span>
      <button
        type="button"
        className="px-3 py-1 text-lg text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onChange(max !== undefined ? Math.min(value + 1, max) : value + 1)}
        disabled={atMax}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
