type BadgeProps = {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning";
};

export default function Badge({ children, tone = "default" }: BadgeProps) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "warning"
        ? "bg-amber-100 text-amber-700"
        : "bg-[#F3E8FF] text-[#6A1B9A]";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${toneClass}`}>
      {children}
    </span>
  );
}
