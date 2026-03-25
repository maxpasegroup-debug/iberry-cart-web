import Link from "next/link";

function contactPhone() {
  return process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || "+91 1800-XXX-XXXX";
}

export default function SiteFooter() {
  const phone = contactPhone();
  const telHref = phone.replace(/\s/g, "").replace(/^\+/, "plus"); // fallback
  const href =
    phone.startsWith("+") || /^\d/.test(phone)
      ? `tel:${phone.replace(/[^\d+]/g, "")}`
      : `tel:${phone}`;

  return (
    <footer className="mt-auto border-t border-[#E1BEE7]/60 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto max-w-screen-xl px-4 py-8 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:px-6 lg:pb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-[Poppins] text-sm font-semibold text-[#6A1B9A]">iBerryCart</p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-gray-600">
              Premium natural products, prepared with care and delivered to your door.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contact</p>
            <a
              href={telHref}
              className="inline-flex items-center gap-2 font-medium text-[#6A1B9A] underline-offset-2 hover:underline"
            >
              {phone}
            </a>
          </div>
          <nav className="flex flex-col gap-2 text-sm" aria-label="Legal">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Policies</p>
            <Link href="/privacy" className="text-gray-700 hover:text-[#6A1B9A]">
              Privacy policy
            </Link>
            <Link href="/returns" className="text-gray-700 hover:text-[#6A1B9A]">
              Return policy
            </Link>
          </nav>
        </div>
        <p className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} iBerryCart. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
