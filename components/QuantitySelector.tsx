"use client";

type QuantitySelectorProps = {
  value: number;
  onChange: (next: number) => void;
};

export default function QuantitySelector({ value, onChange }: QuantitySelectorProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-gray-200 bg-white">
      <button
        type="button"
        className="px-3 py-1 text-lg text-gray-600"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className="min-w-8 text-center text-sm font-medium text-gray-700">{value}</span>
      <button
        type="button"
        className="px-3 py-1 text-lg text-gray-600"
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
