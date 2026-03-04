"use client";

import { useEffect, useMemo, useState } from "react";

type AdminOverview = {
  kpis: {
    productCount: number;
    orderCount: number;
    vendorCount: number;
    categoryCount: number;
    grossRevenue: number;
  };
  orderStatus: Array<{ _id: string; count: number }>;
  lowStock: Array<{ _id: string; name: string; stock: number }>;
};

type AdminProduct = {
  _id: string;
  name: string;
  slug: string;
  stock: number;
  price: number;
  discountPrice?: number | null;
  featured: boolean;
  category?: { _id: string; name: string };
  vendor?: { _id: string; name: string } | null;
};

type AdminOrder = {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
};

type AdminCategory = {
  _id: string;
  name: string;
  slug: string;
};

type Vendor = {
  _id: string;
  name: string;
  email: string;
  status: "pending" | "active" | "suspended";
  dropshipping: boolean;
  region: string;
};

export default function AdminDashboard() {
  const [activePanel, setActivePanel] = useState<
    "overview" | "products" | "orders" | "vendors" | "categories"
  >("overview");

  const [message, setMessage] = useState("");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const [vendorName, setVendorName] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendorRegion, setVendorRegion] = useState("India");
  const [vendorDropshipping, setVendorDropshipping] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");

  const [productName, setProductName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [featured, setFeatured] = useState(false);

  const lowStockCount = useMemo(
    () => overview?.lowStock.filter((item) => item.stock <= 10).length ?? 0,
    [overview],
  );

  async function loadData() {
    const [overviewRes, productsRes, ordersRes, categoriesRes, vendorsRes] =
      await Promise.all([
        fetch("/api/admin/overview", { cache: "no-store" }),
        fetch("/api/admin/products", { cache: "no-store" }),
        fetch("/api/admin/orders", { cache: "no-store" }),
        fetch("/api/admin/categories", { cache: "no-store" }),
        fetch("/api/admin/vendors", { cache: "no-store" }),
      ]);

    const [overviewPayload, productsPayload, ordersPayload, categoriesPayload, vendorsPayload] =
      await Promise.all([
        overviewRes.json(),
        productsRes.json(),
        ordersRes.json(),
        categoriesRes.json(),
        vendorsRes.json(),
      ]);

    if (overviewPayload.ok) setOverview(overviewPayload.data);
    if (productsPayload.ok) setProducts(productsPayload.data);
    if (ordersPayload.ok) setOrders(ordersPayload.data);
    if (categoriesPayload.ok) setCategories(categoriesPayload.data);
    if (vendorsPayload.ok) setVendors(vendorsPayload.data);
  }

  useEffect(() => {
    let active = true;
    void Promise.all([
      fetch("/api/admin/overview", { cache: "no-store" }),
      fetch("/api/admin/products", { cache: "no-store" }),
      fetch("/api/admin/orders", { cache: "no-store" }),
      fetch("/api/admin/categories", { cache: "no-store" }),
      fetch("/api/admin/vendors", { cache: "no-store" }),
    ])
      .then(async ([overviewRes, productsRes, ordersRes, categoriesRes, vendorsRes]) => {
        const [overviewPayload, productsPayload, ordersPayload, categoriesPayload, vendorsPayload] =
          await Promise.all([
            overviewRes.json(),
            productsRes.json(),
            ordersRes.json(),
            categoriesRes.json(),
            vendorsRes.json(),
          ]);

        if (!active) return;
        if (overviewPayload.ok) setOverview(overviewPayload.data);
        if (productsPayload.ok) setProducts(productsPayload.data);
        if (ordersPayload.ok) setOrders(ordersPayload.data);
        if (categoriesPayload.ok) setCategories(categoriesPayload.data);
        if (vendorsPayload.ok) setVendors(vendorsPayload.data);
      })
      .catch(() => {
        if (active) setMessage("Unable to load admin data.");
      });

    return () => {
      active = false;
    };
  }, []);

  function handleImageUpload(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function createVendor() {
    setMessage("");
    const res = await fetch("/api/admin/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: vendorName,
        email: vendorEmail,
        status: "active",
        dropshipping: vendorDropshipping,
        region: vendorRegion,
      }),
    });
    const payload = await res.json();
    setMessage(payload.ok ? "Vendor onboarded." : payload.error);
    if (payload.ok) {
      setVendorName("");
      setVendorEmail("");
      await loadData();
    }
  }

  async function updateVendorStatus(vendorId: string, status: Vendor["status"]) {
    const res = await fetch("/api/admin/vendors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId, status }),
    });
    const payload = await res.json();
    setMessage(payload.ok ? "Vendor status updated." : payload.error);
    if (payload.ok) {
      await loadData();
    }
  }

  async function createProduct() {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: productName,
        slug,
        description,
        price: Number(price),
        discountPrice: Number(discountPrice) || null,
        stock: Number(stock),
        categoryId,
        vendorId: vendorId || null,
        featured,
        image: imageUrl,
      }),
    });
    const payload = await res.json();
    setMessage(payload.ok ? "Product uploaded." : payload.error);
    if (payload.ok) {
      await loadData();
    }
  }

  async function changePassword() {
    setMessage("");
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const payload = await res.json();
    setMessage(payload.ok ? "Password changed." : payload.error);
    if (payload.ok) {
      setCurrentPassword("");
      setNewPassword("");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth/login";
  }

  async function createCategory() {
    setMessage("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: categoryName, slug: categorySlug }),
    });
    const payload = await res.json();
    setMessage(payload.ok ? "Category created." : payload.error);
    if (payload.ok) {
      setCategoryName("");
      setCategorySlug("");
      await loadData();
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    const payload = await res.json();
    setMessage(payload.ok ? "Order status updated." : payload.error);
    if (payload.ok) {
      await loadData();
    }
  }

  async function deleteProduct(productId: string) {
    const res = await fetch(`/api/admin/products?id=${productId}`, {
      method: "DELETE",
    });
    const payload = await res.json();
    setMessage(payload.ok ? "Product deleted." : payload.error);
    if (payload.ok) {
      await loadData();
    }
  }

  async function updateStock(productId: string, stock: number) {
    const res = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, stock }),
    });
    const payload = await res.json();
    setMessage(payload.ok ? "Stock updated." : payload.error);
    if (payload.ok) {
      await loadData();
    }
  }

  return (
    <div className="space-y-4 px-4 pb-8">
      <section className="rounded-xl bg-gradient-to-r from-[#6A1B9A] to-[#8E24AA] p-4 text-white shadow-sm">
        <h1 className="text-lg font-semibold">iBerryCart Commerce Command Center</h1>
        <p className="mt-1 text-xs text-white/90">
          Unified panel for ecommerce, multivendor onboarding, dropshipping operations, and fulfillment.
        </p>
      </section>

      <section className="rounded-xl bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: "overview", label: "Overview" },
            { id: "products", label: "Products" },
            { id: "orders", label: "Orders" },
            { id: "vendors", label: "Vendors" },
            { id: "categories", label: "Categories" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActivePanel(tab.id as typeof activePanel)}
              className={`rounded-full px-3 py-1.5 ${
                activePanel === tab.id
                  ? "bg-[#6A1B9A] text-white"
                  : "bg-[#F3E8FF] text-[#6A1B9A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#6A1B9A]">Admin Security</h2>
        <div className="mt-2 space-y-2">
          <input
            className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={changePassword}
              className="rounded-full bg-[#6A1B9A] px-4 py-2 text-xs text-white"
            >
              Update Password
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-red-50 px-4 py-2 text-xs text-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </section>

      {activePanel === "overview" ? (
        <>
          <section className="grid grid-cols-2 gap-3">
            <article className="rounded-xl bg-white p-3 shadow-sm">
              <p className="text-xs text-gray-500">Products</p>
              <p className="mt-1 text-lg font-semibold text-[#6A1B9A]">{overview?.kpis.productCount ?? 0}</p>
            </article>
            <article className="rounded-xl bg-white p-3 shadow-sm">
              <p className="text-xs text-gray-500">Orders</p>
              <p className="mt-1 text-lg font-semibold text-[#6A1B9A]">{overview?.kpis.orderCount ?? 0}</p>
            </article>
            <article className="rounded-xl bg-white p-3 shadow-sm">
              <p className="text-xs text-gray-500">Vendors</p>
              <p className="mt-1 text-lg font-semibold text-[#6A1B9A]">{overview?.kpis.vendorCount ?? 0}</p>
            </article>
            <article className="rounded-xl bg-white p-3 shadow-sm">
              <p className="text-xs text-gray-500">Revenue</p>
              <p className="mt-1 text-lg font-semibold text-[#6A1B9A]">Rs. {overview?.kpis.grossRevenue ?? 0}</p>
            </article>
          </section>
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#6A1B9A]">Smart Alerts</h2>
            <ul className="mt-2 space-y-1 text-xs text-gray-600">
              <li>{lowStockCount} products need low-stock replenishment.</li>
              <li>{(overview?.orderStatus ?? []).find((s) => s._id === "pending")?.count ?? 0} orders pending action.</li>
              <li>{vendors.filter((v) => v.status !== "active").length} vendors need activation review.</li>
            </ul>
          </section>
        </>
      ) : null}

      {activePanel === "products" ? (
        <>
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#6A1B9A]">Add Product</h2>
            <div className="mt-2 space-y-2">
              <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Name" value={productName} onChange={(e) => setProductName(e.target.value)} />
              <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
              <textarea className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0] ?? null)} />
              <select className="w-full rounded-lg border border-gray-200 p-2 text-sm" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
              <select className="w-full rounded-lg border border-gray-200 p-2 text-sm" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                <option value="">No Vendor (In-house)</option>
                {vendors.map((vendor) => (
                  <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                ))}
              </select>
              <div className="grid grid-cols-3 gap-2">
                <input className="rounded-lg border border-gray-200 p-2 text-sm" placeholder="Price" value={price} onChange={(e) => setPrice(Number(e.target.value))} type="number" />
                <input className="rounded-lg border border-gray-200 p-2 text-sm" placeholder="Discount" value={discountPrice} onChange={(e) => setDiscountPrice(Number(e.target.value))} type="number" />
                <input className="rounded-lg border border-gray-200 p-2 text-sm" placeholder="Stock" value={stock} onChange={(e) => setStock(Number(e.target.value))} type="number" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                Featured Product
              </label>
              <button type="button" onClick={createProduct} className="rounded-full bg-[#6A1B9A] px-4 py-2 text-sm text-white">Save Product</button>
            </div>
          </section>
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#6A1B9A]">Product Catalog</h2>
            <div className="mt-2 space-y-2">
              {products.slice(0, 20).map((product) => (
                <article key={product._id} className="rounded-lg border border-gray-100 p-2 text-xs text-gray-600">
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p>Rs. {product.price} | Stock: {product.stock} | Category: {product.category?.name ?? "-"}</p>
                  <p>Vendor: {product.vendor?.name ?? "In-house"} | {product.featured ? "Featured" : "Standard"}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateStock(product._id, Math.max(0, product.stock + 5))}
                      className="rounded-full bg-[#F3E8FF] px-2 py-1 text-[10px] text-[#6A1B9A]"
                    >
                      +5 Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(product._id)}
                      className="rounded-full bg-red-50 px-2 py-1 text-[10px] text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {activePanel === "orders" ? (
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-[#6A1B9A]">Recent Orders</h2>
          <div className="mt-2 space-y-2">
            {orders.slice(0, 30).map((order) => (
              <article key={order._id} className="rounded-lg border border-gray-100 p-2 text-xs text-gray-600">
                <p className="font-medium text-gray-800">{order.orderNumber}</p>
                <p>Status: {order.status} | Payment: {order.paymentStatus}</p>
                <p>Total: Rs. {order.total} | {new Date(order.createdAt).toLocaleString()}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {["pending", "paid", "packed", "shipped", "delivered", "cancelled"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateOrderStatus(order._id, status)}
                      className="rounded-full bg-[#F3E8FF] px-2 py-1 text-[10px] text-[#6A1B9A]"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {activePanel === "vendors" ? (
        <>
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#6A1B9A]">Onboard Vendor</h2>
            <div className="mt-2 space-y-2">
              <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Vendor Name" value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
              <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Vendor Email" value={vendorEmail} onChange={(e) => setVendorEmail(e.target.value)} />
              <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Region" value={vendorRegion} onChange={(e) => setVendorRegion(e.target.value)} />
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={vendorDropshipping} onChange={(e) => setVendorDropshipping(e.target.checked)} />
                Dropshipping Enabled
              </label>
              <button type="button" onClick={createVendor} className="rounded-full bg-[#6A1B9A] px-4 py-2 text-sm text-white">
                Add Vendor
              </button>
            </div>
          </section>
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#6A1B9A]">Vendor Network</h2>
            <div className="mt-2 space-y-2">
              {vendors.map((vendor) => (
                <article key={vendor._id} className="rounded-lg border border-gray-100 p-2 text-xs text-gray-600">
                  <p className="font-medium text-gray-800">{vendor.name}</p>
                  <p>{vendor.email} | {vendor.region}</p>
                  <p>Status: {vendor.status} | {vendor.dropshipping ? "Dropshipping" : "Fulfilled by iBerryCart"}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(["pending", "active", "suspended"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateVendorStatus(vendor._id, status)}
                        className="rounded-full bg-[#F3E8FF] px-2 py-1 text-[10px] text-[#6A1B9A]"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {activePanel === "categories" ? (
        <>
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#6A1B9A]">Create Category</h2>
            <div className="mt-2 space-y-2">
              <input
                className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                placeholder="Category Name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
              <input
                className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                placeholder="category-slug"
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
              />
              <button
                type="button"
                onClick={createCategory}
                className="rounded-full bg-[#6A1B9A] px-4 py-2 text-sm text-white"
              >
                Save Category
              </button>
            </div>
          </section>
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#6A1B9A]">Categories</h2>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <div key={category._id} className="rounded-lg border border-gray-100 p-2 text-xs text-gray-700">
                  <p className="font-medium">{category.name}</p>
                  <p className="text-gray-500">{category.slug}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {message ? (
        <p className="rounded-lg bg-white p-3 text-xs text-gray-600 shadow-sm">{message}</p>
      ) : null}
    </div>
  );
}
