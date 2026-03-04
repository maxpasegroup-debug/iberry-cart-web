import { Grid, Home, ShoppingCart, User } from "lucide-react";

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 h-[65px] border-t border-gray-200 bg-white lg:hidden">
      <div className="mx-auto flex h-full w-full max-w-screen-md items-center justify-between px-6">
        <button
          type="button"
          aria-label="Home"
          className="flex flex-col items-center text-[#6A1B9A]"
        >
          <Home size={20} />
          <span className="mt-1 text-xs">Home</span>
        </button>

        <button
          type="button"
          aria-label="Categories"
          className="flex flex-col items-center text-gray-400"
        >
          <Grid size={20} />
          <span className="mt-1 text-xs">Categories</span>
        </button>

        <button
          type="button"
          aria-label="Account"
          className="flex flex-col items-center text-gray-400"
        >
          <User size={20} />
          <span className="mt-1 text-xs">Account</span>
        </button>

        <button
          type="button"
          aria-label="Cart"
          className="flex flex-col items-center text-gray-400"
        >
          <ShoppingCart size={20} />
          <span className="mt-1 text-xs">Cart</span>
        </button>
      </div>
    </nav>
  );
}
