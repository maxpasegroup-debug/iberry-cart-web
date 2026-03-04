import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] p-4">
      <div className="mx-auto mt-8 max-w-md rounded-xl bg-white p-5 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-[#6A1B9A]">Page not found</h2>
        <p className="mt-2 text-sm text-gray-500">
          The page you are looking for does not exist.
        </p>
        <Link href="/" className="mt-4 inline-block rounded-full bg-[#6A1B9A] px-4 py-2 text-sm text-white">
          Go Home
        </Link>
      </div>
    </div>
  );
}
