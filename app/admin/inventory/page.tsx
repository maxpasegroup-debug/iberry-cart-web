import AdminDashboard from "@/components/AdminDashboard";

export default function AdminInventoryPage() {
  // The products panel includes stock controls via `/api/admin/inventory`.
  return <AdminDashboard initialPanel="products" />;
}
