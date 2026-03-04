"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#F3E8FF] p-4">
      <div className="mx-auto mt-8 max-w-md rounded-xl bg-white p-5 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-[#6A1B9A]">Something went wrong</h2>
        <p className="mt-2 text-sm text-gray-500">{error.message}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 rounded-full bg-[#6A1B9A] px-4 py-2 text-sm text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
