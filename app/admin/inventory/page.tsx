export default function AdminInventoryPage() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] p-4">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold text-[#6A1B9A]">Inventory Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Use `/api/admin/inventory` to update stock for products.
        </p>
      </div>
    </div>
  );
}
