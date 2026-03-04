import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your iBerryCart account.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-6">
      <AuthForm mode="register" />
    </div>
  );
}
