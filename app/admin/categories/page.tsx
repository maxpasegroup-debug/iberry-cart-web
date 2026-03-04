export default function AdminCategoriesPage() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] p-4">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold text-[#6A1B9A]">Categories Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Use `/api/admin/categories` to manage category entities.
        </p>
      </div>
    </div>
  );
}
