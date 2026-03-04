type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="mx-4 rounded-xl bg-white p-6 text-center shadow-sm">
      <h2 className="text-base font-semibold text-[#6A1B9A]">{title}</h2>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}
