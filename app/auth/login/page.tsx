import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your iBerryCart account.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-6">
      <AuthForm mode="login" />
    </div>
  );
}
