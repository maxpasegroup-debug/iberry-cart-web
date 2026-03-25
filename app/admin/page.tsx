import type { Metadata } from "next";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin",
  description: "iBerryCart admin panel for operations and management.",
};

export default function AdminPage() {
  return (
    <AdminDashboard initialPanel="overview" />
  );
}
