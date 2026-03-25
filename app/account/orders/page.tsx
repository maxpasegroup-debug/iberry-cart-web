import Link from "next/link";
import type { Metadata } from "next";
import { getAuthUserFromCookie } from "@/lib/auth";
import { apiFetchSafe } from "@/lib/server-fetch";
import EmptyState from "@/components/EmptyState";

type OrderSummary = {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
};

export const metadata: Metadata = {
  title: "My Orders",
  description: "View your order history on iBerryCart.",
};

export default async function AccountOrdersPage() {
  const user = await getAuthUserFromCookie();
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-6">
        <div className="pt-6">
          <EmptyState title="Sign in required" description="Login to view your orders." />
        </div>
      </div>
    );
  }

  const orders = await apiFetchSafe<OrderSummary[]>("/api/orders", []);

  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-10">
      <h1 className="mx-4 pt-4 text-xl font-semibold text-[#6A1B9A] lg:mx-auto lg:max-w-screen-xl">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="mt-6 mx-4 lg:mx-auto lg:max-w-screen-xl">
          <EmptyState title="No orders yet" description="Place an order to see it here." />
        </div>
      ) : (
        <section className="mx-4 mt-4 space-y-3 lg:mx-auto lg:max-w-screen-xl">
          {orders.map((order) => (
            <article key={order._id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-gray-600">
                    Status: {order.status} | Payment: {order.paymentStatus}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-800">Total: Rs. {order.total}</p>
                  <p className="mt-1 text-xs text-gray-600">
                    Placed: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <Link
                  href={`/order/${order._id}/success`}
                  className="rounded-full bg-[#6A1B9A] px-4 py-2 text-xs text-white whitespace-nowrap"
                >
                  View
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

