import Link from "next/link";
import type { Metadata } from "next";
import { Package } from "lucide-react";
import { getAuthUserFromCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getOrCreateSessionId } from "@/lib/session";
import EmptyState from "@/components/EmptyState";
import SmartImage from "@/components/SmartImage";
import OrderModel from "@/models/Order";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View your order history on iBerryCart.",
};

type OrderItem = {
  name: string;
  image: string;
  quantity: number;
  price: number;
  discountPrice: number | null;
};

type OrderDoc = {
  _id: { toString(): string };
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: Date;
  items: OrderItem[];
};

function formatRs(n: number) {
  return `Rs. ${n.toLocaleString("en-IN")}`;
}

function unitPrice(item: OrderItem) {
  if (item.discountPrice != null && item.discountPrice > 0) {
    return item.discountPrice;
  }
  return item.price;
}

function lineTotal(item: OrderItem) {
  return unitPrice(item) * item.quantity;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900 ring-amber-200",
  paid: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  packed: "bg-sky-100 text-sky-900 ring-sky-200",
  shipped: "bg-indigo-100 text-indigo-900 ring-indigo-200",
  delivered: "bg-green-100 text-green-900 ring-green-200",
  cancelled: "bg-gray-100 text-gray-700 ring-gray-200",
};

const PAYMENT_LABEL: Record<string, string> = {
  pending: "Payment pending",
  authorized: "Authorized",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
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

  await connectToDatabase();
  const sessionId = await getOrCreateSessionId();
  const query = { $or: [{ sessionId }, { user: user.userId }] };

  const raw = await OrderModel.find(query)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const orders = raw as unknown as OrderDoc[];

  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-12">
      <div className="mx-auto max-w-7xl px-4 pt-4 lg:pt-8">
        <header className="mb-2">
          <h1 className="text-xl font-semibold text-[#6A1B9A] lg:text-2xl">My orders</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track shipments and reorder with confidence—every purchase is saved here.
          </p>
        </header>

        {orders.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<Package className="h-12 w-12" strokeWidth={1.25} />}
              title="No orders yet"
              description="When you place an order, it will appear here with full details so you can track status anytime."
              action={
                <Link
                  href="/products"
                  className="inline-flex rounded-full bg-[#6A1B9A] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#5a1682]"
                >
                  Browse products
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="mt-6 space-y-5">
            {orders.map((order) => {
              const id = String(order._id);
              const date = new Date(order.createdAt);
              const statusKey = order.status ?? "pending";
              const statusClass =
                STATUS_CLASS[statusKey] ?? "bg-violet-100 text-violet-900 ring-violet-200";
              const statusLabel = STATUS_LABEL[statusKey] ?? statusKey;

              return (
                <li key={id}>
                  <article className="overflow-hidden rounded-2xl border border-[#E9D5FF]/80 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Order ID
                        </p>
                        <p className="mt-0.5 font-mono text-sm font-semibold text-gray-900">
                          {order.orderNumber}
                        </p>
                        <time
                          dateTime={date.toISOString()}
                          className="mt-2 block text-sm text-gray-600"
                        >
                          {date.toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </time>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass}`}
                        >
                          {statusLabel}
                        </span>
                        <span className="text-xs text-gray-500">
                          {PAYMENT_LABEL[order.paymentStatus] ?? order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-50">
                      {order.items.map((item, idx) => (
                        <div
                          key={`${id}-${idx}-${item.name}`}
                          className="flex gap-3 p-4"
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#F3E8FF]">
                            <SmartImage
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              Qty {item.quantity} × {formatRs(unitPrice(item))}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-semibold text-gray-900">
                            {formatRs(lineTotal(item))}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-base font-semibold text-[#6A1B9A]">
                        Total <span className="text-gray-900">{formatRs(order.total)}</span>
                      </p>
                      <Link
                        href={`/order/${id}/success`}
                        className="inline-flex justify-center rounded-full border border-[#6A1B9A] bg-white px-4 py-2 text-sm font-medium text-[#6A1B9A] transition hover:bg-[#F3E8FF] sm:min-w-[9rem]"
                      >
                        Order details
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
