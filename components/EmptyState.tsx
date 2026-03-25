import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="mx-4 rounded-xl bg-white p-8 text-center shadow-sm">
      {icon ? <div className="mx-auto mb-4 flex justify-center text-[#6A1B9A]/90">{icon}</div> : null}
      <h2 className="text-base font-semibold text-[#6A1B9A]">{title}</h2>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
