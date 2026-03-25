"use client";

import { useEffect, useMemo, useState } from "react";
import { withCsrfHeaders } from "@/lib/csrf-client";

type AdminOverview = {
  kpis: {
    productCount: number;
    orderCount: number;
    vendorCount: number;
    categoryCount: number;
    brandCount: number;
    grossRevenue: number;
  };
  orderStatus: Array<{ _id: string; count: number }>;
  brandMix: Array<{ _id: "own" | "partner" | "dropshipping"; count: number }>;
  lowStock: Array<{ _id: string; name: string; stock: number }>;
};

type AdminProduct = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  stock: number;
  price: number;
  discountPrice?: number | null;
  image: string;
  featured: boolean;
  category?: { _id: string; name: string };
  brand?: { _id: string; name: string; type: "own" | "partner" | "dropshipping" } | null;
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

type Brand = {
  _id: string;
  name: string;
  slug: string;
  type: "own" | "partner" | "dropshipping";
  onboardingStatus: "pending" | "approved" | "rejected";
  contactEmail?: string;
  commissionRate?: number;
};

type AdminPanel = "overview" | "brands" | "products" | "orders" | "vendors" | "categories";

export default function AdminDashboard({ initialPanel }: { initialPanel?: AdminPanel }) {
  const [activePanel, setActivePanel] = useState<AdminPanel>(initialPanel ?? "overview");

  const [message, setMessage] = useState("");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [vendorName, setVendorName] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendorRegion, setVendorRegion] = useState("India");
  const [vendorDropshipping, setVendorDropshipping] = useState(true);
  const [ownBrandName, setOwnBrandName] = useState("");
  const [ownBrandSlug, setOwnBrandSlug] = useState("");
  const [ownBrandEmail, setOwnBrandEmail] = useState("");
  const [partnerBrandName, setPartnerBrandName] = useState("");
  const [partnerBrandSlug, setPartnerBrandSlug] = useState("");
  const [partnerBrandEmail, setPartnerBrandEmail] = useState("");
  const [dropshipBrandName, setDropshipBrandName] = useState("");
  const [dropshipBrandSlug, setDropshipBrandSlug] = useState("");
  const [dropshipBrandEmail, setDropshipBrandEmail] = useState("");
  const [dropshipCommission, setDropshipCommission] = useState(12);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [productName, setProductName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [featured, setFeatured] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterStock, setFilterStock] = useState<"all" | "low" | "out" | "ok">("all");
  const [pendingDeleteProductId, setPendingDeleteProductId] = useState<string | null>(null);

  type Toast = { type: "success" | "error"; text: string };
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(t);
  }, [toast]);

  function showToast(type: Toast["type"], text: string) {
    setToast({ type, text });
  }

  const filteredProducts = useMemo(() => {
    let list = products;
    const q = productSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }
    if (filterCategoryId) {
      list = list.filter((p) => p.category?._id === filterCategoryId);
    }
    if (filterStock === "low") {
      list = list.filter((p) => p.stock > 0 && p.stock <= 10);
    } else if (filterStock === "out") {
      list = list.filter((p) => p.stock === 0);
    } else if (filterStock === "ok") {
      list = list.filter((p) => p.stock > 10);
    }
    return list;
  }, [products, productSearch, filterCategoryId, filterStock]);

  const lowStockProductsCount = useMemo(
    () => products.filter((p) => p.stock <= 10).length,
    [products],
  );
  const brandTypeCount = useMemo(
    () =>
      (overview?.brandMix ?? []).reduce(
        (acc, curr) => ({ ...acc, [curr._id]: curr.count }),
        { own: 0, partner: 0, dropshipping: 0 } as Record<
          "own" | "partner" | "dropshipping",
          number
        >,
      ),
    [overview],
  );

  async function loadData() {
    const [overviewRes, productsRes, ordersRes, categoriesRes, vendorsRes, brandsRes] =
      await Promise.all([
        fetch("/api/admin/overview", { cache: "no-store" }),
        fetch("/api/admin/products", { cache: "no-store" }),
        fetch("/api/admin/orders", { cache: "no-store" }),
        fetch("/api/admin/categories", { cache: "no-store" }),
        fetch("/api/admin/vendors", { cache: "no-store" }),
        fetch("/api/admin/brands", { cache: "no-store" }),
      ]);

    const [overviewPayload, productsPayload, ordersPayload, categoriesPayload, vendorsPayload, brandsPayload] =
      await Promise.all([
        overviewRes.json(),
        productsRes.json(),
        ordersRes.json(),
        categoriesRes.json(),
        vendorsRes.json(),
        brandsRes.json(),
      ]);

    if (overviewPayload.ok) setOverview(overviewPayload.data);
    if (productsPayload.ok) setProducts(productsPayload.data);
    if (ordersPayload.ok) setOrders(ordersPayload.data);
    if (categoriesPayload.ok) setCategories(categoriesPayload.data);
    if (vendorsPayload.ok) setVendors(vendorsPayload.data);
    if (brandsPayload.ok) setBrands(brandsPayload.data);
  }

  useEffect(() => {
    let active = true;
    void Promise.all([
      fetch("/api/admin/overview", { cache: "no-store" }),
      fetch("/api/admin/products", { cache: "no-store" }),
      fetch("/api/admin/orders", { cache: "no-store" }),
      fetch("/api/admin/categories", { cache: "no-store" }),
      fetch("/api/admin/vendors", { cache: "no-store" }),
      fetch("/api/admin/brands", { cache: "no-store" }),
    ])
      .then(async ([overviewRes, productsRes, ordersRes, categoriesRes, vendorsRes, brandsRes]) => {
        const [overviewPayload, productsPayload, ordersPayload, categoriesPayload, vendorsPayload, brandsPayload] =
          await Promise.all([
            overviewRes.json(),
            productsRes.json(),
            ordersRes.json(),
            categoriesRes.json(),
            vendorsRes.json(),
            brandsRes.json(),
          ]);

        if (!active) return;
        if (overviewPayload.ok) setOverview(overviewPayload.data);
        if (productsPayload.ok) setProducts(productsPayload.data);
        if (ordersPayload.ok) setOrders(ordersPayload.data);
        if (categoriesPayload.ok) setCategories(categoriesPayload.data);
        if (vendorsPayload.ok) setVendors(vendorsPayload.data);
        if (brandsPayload.ok) setBrands(brandsPayload.data);
      })
      .catch(() => {
        if (active) showToast("error", "Unable to load admin data.");
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleImageUpload(file: File | null) {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "iberrycart/products");

      const res = await csrfFetch("/api/upload", { method: "POST", body: formData });
      const payload = await res.json();

      if (!payload.ok) {
        showToast("error", typeof payload.error === "string" ? payload.error : "Image upload failed.");
        return;
      }

      setImageUrl(payload.data.secure_url);
      showToast("success", "Image uploaded.");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Image upload failed.");
    }
  }

  async function csrfFetch(url: string, init: RequestInit) {
    const headers = await withCsrfHeaders(init.headers);
    return fetch(url, { ...init, headers });
  }

  async function createVendor() {
    setMessage("");
    const res = await csrfFetch("/api/admin/vendors", {
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
    const res = await csrfFetch("/api/admin/vendors", {
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

  function fillProductForm(product: AdminProduct) {
    setEditingProductId(product._id);
    setProductName(product.name);
    setSlug(product.slug);
    setDescription(product.description);
    setPrice(product.price);
    setDiscountPrice(product.discountPrice ?? 0);
    setStock(product.stock);
    setCategoryId(product.category?._id ?? "");
    setVendorId(product.vendor?._id ?? "");
    setBrandId(product.brand?._id ?? "");
    setFeatured(product.featured);
    setImageUrl(product.image);
  }

  function openAddProductModal() {
    resetProductForm();
    setProductModalOpen(true);
  }

  function openEditProductModal(product: AdminProduct) {
    fillProductForm(product);
    setProductModalOpen(true);
  }

  function resetProductForm() {
    setEditingProductId(null);
    setProductName("");
    setSlug("");
    setDescription("");
    setPrice(0);
    setDiscountPrice(0);
    setStock(0);
    setCategoryId("");
    setVendorId("");
    setBrandId("");
    setFeatured(false);
    setImageUrl("");
  }

  function closeProductModal() {
    setProductModalOpen(false);
    resetProductForm();
  }

  async function saveProduct() {
    if (!imageUrl) {
      showToast("error", "Please upload an image or paste a Cloudinary image URL.");
      return;
    }

    const isEdit = Boolean(editingProductId);
    const res = await csrfFetch("/api/admin/products", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(isEdit ? { productId: editingProductId } : {}),
        name: productName,
        slug,
        description,
        price: Number(price),
        discountPrice: Number(discountPrice) || null,
        stock: Number(stock),
        categoryId,
        vendorId: vendorId || null,
        brandId: brandId || null,
        featured,
        image: imageUrl,
      }),
    });

    const payload = await res.json();
    if (payload.ok) {
      showToast("success", isEdit ? "Product updated." : "Product created.");
      await loadData();
      closeProductModal();
    } else {
      showToast("error", typeof payload.error === "string" ? payload.error : "Could not save product.");
    }
  }

  async function toggleProductFeatured(product: AdminProduct) {
    const res = await csrfFetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product._id,
        featured: !product.featured,
      }),
    });
    const payload = await res.json();
    if (payload.ok) {
      showToast("success", !product.featured ? "Marked as featured." : "Removed from featured.");
      await loadData();
    } else {
      showToast("error", typeof payload.error === "string" ? payload.error : "Could not update featured.");
    }
  }

  async function changePassword() {
    setMessage("");
    const res = await csrfFetch("/api/auth/change-password", {
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
    await csrfFetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/auth/login");
  }

  function startEditCategory(category: AdminCategory) {
    setEditingCategoryId(category._id);
    setCategoryName(category.name);
    setCategorySlug(category.slug);
  }

  function resetCategoryForm() {
    setEditingCategoryId(null);
    setCategoryName("");
    setCategorySlug("");
  }

  async function saveCategory() {
    setMessage("");
    const isEdit = Boolean(editingCategoryId);
    const res = await csrfFetch("/api/admin/categories", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(isEdit ? { categoryId: editingCategoryId } : {}),
        name: categoryName,
        slug: categorySlug,
      }),
    });
    const payload = await res.json();
    setMessage(payload.ok ? (isEdit ? "Category updated." : "Category created.") : payload.error);
    if (payload.ok) {
      resetCategoryForm();
      await loadData();
    }
  }

  async function deleteCategory(categoryIdToDelete: string) {
    setMessage("");
    const res = await csrfFetch(`/api/admin/categories?id=${categoryIdToDelete}`, {
      method: "DELETE",
    });
    const payload = await res.json();
    setMessage(payload.ok ? "Category deleted." : payload.error);
    if (payload.ok) {
      resetCategoryForm();
      await loadData();
    }
  }

  async function createBrand(payload: {
    name: string;
    slug: string;
    type: "own" | "partner" | "dropshipping";
    contactEmail: string;
    commissionRate?: number;
  }) {
    setMessage("");
    const res = await csrfFetch("/api/admin/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        onboardingStatus: "approved",
        commissionRate: payload.commissionRate ?? 0,
      }),
    });
    const data = await res.json();
    setMessage(data.ok ? "Brand onboarding completed." : data.error);
    if (data.ok) {
      await loadData();
    }
  }

  async function updateBrandStatus(brandIdToUpdate: string, onboardingStatus: "pending" | "approved" | "rejected") {
    const res = await csrfFetch("/api/admin/brands", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: brandIdToUpdate, onboardingStatus }),
    });
    const payload = await res.json();
    setMessage(payload.ok ? "Brand status updated." : payload.error);
    if (payload.ok) {
      await loadData();
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    const res = await csrfFetch("/api/admin/orders", {
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

  function requestDeleteProduct(productId: string) {
    setPendingDeleteProductId(productId);
  }

  function cancelDeleteProduct() {
    setPendingDeleteProductId(null);
  }

  async function confirmDeleteProduct() {
    if (!pendingDeleteProductId) return;
    const id = pendingDeleteProductId;
    setPendingDeleteProductId(null);
    const res = await csrfFetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    const payload = await res.json();
    if (payload.ok) {
      showToast("success", "Product deleted.");
      await loadData();
    } else {
      showToast("error", typeof payload.error === "string" ? payload.error : "Could not delete product.");
    }
  }

  async function updateStock(productId: string, nextStock: number) {
    const res = await csrfFetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, stock: nextStock }),
    });
    const payload = await res.json();
    if (payload.ok) {
      showToast("success", "Stock updated.");
      await loadData();
    } else {
      showToast("error", typeof payload.error === "string" ? payload.error : "Could not update stock.");
    }
  }

  return (
    <div className="space-y-4 px-4 pb-8">
      <section className="rounded-xl bg-gradient-to-r from-[#6A1B9A] to-[#8E24AA] p-4 text-white shadow-sm">
        <h1 className="text-lg font-semibold">iBerryCart Manager Console</h1>
        <p className="mt-1 text-xs text-white/90">
          Single-manager control center for ecommerce + hybrid dropshipping operations.
        </p>
      </section>

      <section className="rounded-xl bg-white p-3 shadow-sm">
        <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-6">
          {[
            { id: "overview", label: "Overview" },
            { id: "brands", label: "Brand Modules" },
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
          <section className="grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total products</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-[#6A1B9A]">
                {overview?.kpis.productCount ?? 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">Everything listed in your store catalog.</p>
            </article>
            <article className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total orders</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-[#6A1B9A]">
                {overview?.kpis.orderCount ?? 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">All-time order volume.</p>
            </article>
            <article className="rounded-xl border border-amber-100 bg-amber-50/80 p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-900/80">Low stock</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-amber-900">
                {lowStockProductsCount}
              </p>
              <p className="mt-1 text-xs text-amber-900/70">Products at 10 units or below (including out of stock).</p>
            </article>
          </section>

          <section className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold text-[#6A1B9A]">Items running low</h2>
              <span className="text-xs text-gray-500">Up to 8 shown — restock these first.</span>
            </div>
            {(overview?.lowStock ?? []).length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">No low-stock alerts. Great job keeping inventory healthy.</p>
            ) : (
              <ul className="mt-3 divide-y divide-gray-100">
                {(overview?.lowStock ?? []).map((item) => (
                  <li key={item._id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums ${
                        item.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {item.stock === 0 ? "Out" : `${item.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <article className="rounded-xl bg-white p-3 shadow-sm">
              <p className="text-xs text-gray-500">Vendors</p>
              <p className="mt-1 text-lg font-semibold text-[#6A1B9A]">{overview?.kpis.vendorCount ?? 0}</p>
            </article>
            <article className="rounded-xl bg-white p-3 shadow-sm">
              <p className="text-xs text-gray-500">Revenue</p>
              <p className="mt-1 text-lg font-semibold text-[#6A1B9A]">Rs. {overview?.kpis.grossRevenue ?? 0}</p>
            </article>
            <article className="rounded-xl bg-white p-3 shadow-sm">
              <p className="text-xs text-gray-500">Brands</p>
              <p className="mt-1 text-lg font-semibold text-[#6A1B9A]">{overview?.kpis.brandCount ?? 0}</p>
            </article>
            <article className="rounded-xl bg-white p-3 shadow-sm md:col-span-3 lg:col-span-3">
              <p className="text-xs text-gray-500">Brand mix</p>
              <p className="mt-1 text-xs font-semibold text-[#6A1B9A]">
                Own {brandTypeCount.own} · Partner {brandTypeCount.partner} · Dropship {brandTypeCount.dropshipping}
              </p>
            </article>
          </section>
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#6A1B9A]">Smart alerts</h2>
            <ul className="mt-2 space-y-1 text-xs text-gray-600">
              <li>{lowStockProductsCount} products are at or below 10 units in stock.</li>
              <li>{(overview?.orderStatus ?? []).find((s) => s._id === "pending")?.count ?? 0} orders pending action.</li>
              <li>{vendors.filter((v) => v.status !== "active").length} vendors need activation review.</li>
              <li>Newest products appear automatically in public New Arrivals.</li>
            </ul>
          </section>
        </>
      ) : null}

      {activePanel === "brands" ? (
        <>
          <section className="grid gap-3 md:grid-cols-3">
            <article className="rounded-xl bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-[#6A1B9A]">Own Brand Module</h2>
              <div className="mt-2 space-y-2">
                <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Brand Name" value={ownBrandName} onChange={(e) => setOwnBrandName(e.target.value)} />
                <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="brand-slug" value={ownBrandSlug} onChange={(e) => setOwnBrandSlug(e.target.value)} />
                <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Contact Email" value={ownBrandEmail} onChange={(e) => setOwnBrandEmail(e.target.value)} />
                <button
                  type="button"
                  onClick={() =>
                    void createBrand({
                      name: ownBrandName,
                      slug: ownBrandSlug,
                      type: "own",
                      contactEmail: ownBrandEmail,
                      commissionRate: 0,
                    })
                  }
                  className="rounded-full bg-[#6A1B9A] px-4 py-2 text-xs text-white"
                >
                  Add Own Brand
                </button>
              </div>
            </article>

            <article className="rounded-xl bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-[#6A1B9A]">Partner Brand Onboarding</h2>
              <div className="mt-2 space-y-2">
                <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Brand Name" value={partnerBrandName} onChange={(e) => setPartnerBrandName(e.target.value)} />
                <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="partner-brand-slug" value={partnerBrandSlug} onChange={(e) => setPartnerBrandSlug(e.target.value)} />
                <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Contact Email" value={partnerBrandEmail} onChange={(e) => setPartnerBrandEmail(e.target.value)} />
                <button
                  type="button"
                  onClick={() =>
                    void createBrand({
                      name: partnerBrandName,
                      slug: partnerBrandSlug,
                      type: "partner",
                      contactEmail: partnerBrandEmail,
                      commissionRate: 8,
                    })
                  }
                  className="rounded-full bg-[#6A1B9A] px-4 py-2 text-xs text-white"
                >
                  Onboard Partner Brand
                </button>
              </div>
            </article>

            <article className="rounded-xl bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-[#6A1B9A]">Dropshipping Onboarding</h2>
              <div className="mt-2 space-y-2">
                <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Brand Name" value={dropshipBrandName} onChange={(e) => setDropshipBrandName(e.target.value)} />
                <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="dropship-brand-slug" value={dropshipBrandSlug} onChange={(e) => setDropshipBrandSlug(e.target.value)} />
                <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Contact Email" value={dropshipBrandEmail} onChange={(e) => setDropshipBrandEmail(e.target.value)} />
                <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" type="number" placeholder="Commission %" value={dropshipCommission} onChange={(e) => setDropshipCommission(Number(e.target.value))} />
                <button
                  type="button"
                  onClick={() =>
                    void createBrand({
                      name: dropshipBrandName,
                      slug: dropshipBrandSlug,
                      type: "dropshipping",
                      contactEmail: dropshipBrandEmail,
                      commissionRate: dropshipCommission,
                    })
                  }
                  className="rounded-full bg-[#6A1B9A] px-4 py-2 text-xs text-white"
                >
                  Onboard Dropshipping Brand
                </button>
              </div>
            </article>
          </section>

          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#6A1B9A]">Brand Directory</h2>
            <div className="mt-2 space-y-2">
              {brands.map((brand) => (
                <article key={brand._id} className="rounded-lg border border-gray-100 p-2 text-xs text-gray-600">
                  <p className="font-medium text-gray-800">{brand.name} ({brand.type})</p>
                  <p>Slug: {brand.slug} | Status: {brand.onboardingStatus}</p>
                  <p>Contact: {brand.contactEmail || "-"} | Commission: {brand.commissionRate ?? 0}%</p>
                  <div className="mt-2 flex gap-1">
                    {(["pending", "approved", "rejected"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => void updateBrandStatus(brand._id, status)}
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

      {activePanel === "products" ? (
        <>
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#6A1B9A]">Product catalog</h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Search, filter, and edit without leaving this page.
                </p>
              </div>
              <button
                type="button"
                onClick={openAddProductModal}
                className="inline-flex items-center justify-center rounded-lg bg-[#6A1B9A] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#5a1582]"
              >
                Add product
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
              <input
                className="min-w-[200px] flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Search by name or slug…"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                aria-label="Search products"
              />
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value as typeof filterStock)}
                aria-label="Filter by stock level"
              >
                <option value="all">All stock levels</option>
                <option value="low">Low (1–10)</option>
                <option value="out">Out of stock</option>
                <option value="ok">Healthy (&gt;10)</option>
              </select>
              <p className="text-xs text-gray-500 lg:ml-auto">
                Showing <span className="font-medium text-gray-700">{filteredProducts.length}</span> of{" "}
                {products.length}
              </p>
            </div>

            <div className="mt-4 overflow-x-auto rounded-lg border border-gray-100">
              <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
                <thead className="bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="whitespace-nowrap px-3 py-2.5">Image</th>
                    <th className="min-w-[140px] px-3 py-2.5">Name</th>
                    <th className="whitespace-nowrap px-3 py-2.5">Category</th>
                    <th className="whitespace-nowrap px-3 py-2.5">Price</th>
                    <th className="whitespace-nowrap px-3 py-2.5">Stock</th>
                    <th className="whitespace-nowrap px-3 py-2.5">Featured</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-500">
                        No products match your filters. Try clearing search or filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product._id} className="align-middle hover:bg-gray-50/50">
                        <td className="px-3 py-2">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt=""
                              className="h-12 w-12 rounded-md border border-gray-100 object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 text-[10px] text-gray-400">
                              No img
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.slug}</p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                          {product.category?.name ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 tabular-nums text-gray-800">
                          Rs. {product.price}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${
                              product.stock === 0
                                ? "bg-red-50 text-red-700"
                                : product.stock <= 10
                                  ? "bg-amber-50 text-amber-900"
                                  : "bg-emerald-50 text-emerald-800"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => void toggleProductFeatured(product)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                              product.featured
                                ? "bg-[#6A1B9A] text-white"
                                : "border border-gray-200 bg-white text-gray-600 hover:border-[#6A1B9A]/40"
                            }`}
                            aria-pressed={product.featured}
                          >
                            {product.featured ? "Featured" : "Standard"}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditProductModal(product)}
                              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-[#6A1B9A] hover:bg-[#F3E8FF]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void updateStock(product._id, Math.max(0, product.stock + 5))}
                              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              +5 stock
                            </button>
                            <button
                              type="button"
                              onClick={() => requestDeleteProduct(product._id)}
                              className="rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {productModalOpen ? (
            <div
              className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-modal-title"
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/45"
                aria-label="Close dialog"
                onClick={closeProductModal}
              />
              <div className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
                <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
                  <h2 id="product-modal-title" className="text-base font-semibold text-[#6A1B9A]">
                    {editingProductId ? "Edit product" : "Add product"}
                  </h2>
                  <button
                    type="button"
                    onClick={closeProductModal}
                    className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                  <div className="space-y-3">
                    <input
                      className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                      placeholder="Name"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                    <input
                      className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                      placeholder="Slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                    />
                    <textarea
                      className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                      placeholder="Description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <div>
                      <p className="mb-1 text-xs font-medium text-gray-600">Product image</p>
                      <input
                        className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                        placeholder="Image URL (or upload below)"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                      <input
                        className="mt-2 w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#F3E8FF] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#6A1B9A]"
                        type="file"
                        accept="image/*"
                        onChange={(e) => void handleImageUpload(e.target.files?.[0] ?? null)}
                      />
                      {imageUrl ? (
                        <div className="mt-3 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                          <img src={imageUrl} alt="Preview" className="mx-auto max-h-48 w-full object-contain" />
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-gray-500">Upload a file or paste a URL to see a preview.</p>
                      )}
                    </div>
                    <select
                      className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                    >
                      <option value="">No vendor (in-house)</option>
                      {vendors.map((vendor) => (
                        <option key={vendor._id} value={vendor._id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                      value={brandId}
                      onChange={(e) => setBrandId(e.target.value)}
                    >
                      <option value="">Select brand</option>
                      {brands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.name} ({brand.type})
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        className="rounded-lg border border-gray-200 p-2 text-sm"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        type="number"
                      />
                      <input
                        className="rounded-lg border border-gray-200 p-2 text-sm"
                        placeholder="Discount"
                        value={discountPrice}
                        onChange={(e) => setDiscountPrice(Number(e.target.value))}
                        type="number"
                      />
                      <input
                        className="rounded-lg border border-gray-200 p-2 text-sm"
                        placeholder="Stock"
                        value={stock}
                        onChange={(e) => setStock(Number(e.target.value))}
                        type="number"
                      />
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#6A1B9A] focus:ring-[#6A1B9A]"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                      />
                      Featured on storefront
                    </label>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2 border-t border-gray-100 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => void saveProduct()}
                    className="flex-1 rounded-lg bg-[#6A1B9A] py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#5a1582]"
                  >
                    {editingProductId ? "Save changes" : "Create product"}
                  </button>
                  <button
                    type="button"
                    onClick={closeProductModal}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {pendingDeleteProductId ? (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-product-title"
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/50"
                aria-label="Dismiss"
                onClick={cancelDeleteProduct}
              />
              <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
                <h2 id="delete-product-title" className="text-base font-semibold text-gray-900">
                  Delete this product?
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  This removes{" "}
                  <span className="font-medium text-gray-900">
                    {products.find((p) => p._id === pendingDeleteProductId)?.name ?? "this product"}
                  </span>{" "}
                  from your catalog. This cannot be undone.
                </p>
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={cancelDeleteProduct}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void confirmDeleteProduct()}
                    className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Delete product
                  </button>
                </div>
              </div>
            </div>
          ) : null}
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
            <h2 className="text-sm font-semibold text-[#6A1B9A]">
              {editingCategoryId ? "Edit Category" : "Create Category"}
            </h2>
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
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveCategory}
                  className="flex-1 rounded-full bg-[#6A1B9A] px-4 py-2 text-sm text-white"
                >
                  {editingCategoryId ? "Save Changes" : "Save Category"}
                </button>
                {editingCategoryId ? (
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="rounded-full bg-white px-4 py-2 text-sm text-[#6A1B9A] border border-gray-200"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          </section>
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#6A1B9A]">Categories</h2>
            <div className="mt-2 space-y-2">
              {categories.map((category) => (
                <article key={category._id} className="rounded-lg border border-gray-100 p-2 text-xs text-gray-700">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-800">{category.name}</p>
                      <p className="text-gray-500">{category.slug}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => startEditCategory(category)}
                        className="rounded-full bg-[#F3E8FF] px-2 py-1 text-[10px] text-[#6A1B9A]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteCategory(category._id)}
                        className="rounded-full bg-red-50 px-2 py-1 text-[10px] text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {toast ? (
        <div
          className={`fixed bottom-4 right-4 z-[70] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
          role="status"
        >
          {toast.text}
        </div>
      ) : null}

      {message ? (
        <p className="rounded-lg bg-white p-3 text-xs text-gray-600 shadow-sm">{message}</p>
      ) : null}
    </div>
  );
}
