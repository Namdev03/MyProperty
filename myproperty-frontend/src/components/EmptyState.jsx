import { SearchX } from "lucide-react";

export function EmptyState({
  icon: Icon = SearchX,
  title = "Nothing here yet",
  message = "Try adjusting your search or filters.",
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#E7E4DC] px-6 py-16 text-center">
      <div className="rounded-full bg-[#14213D]/5 p-4">
        <Icon size={28} className="text-[#14213D]/40" />
      </div>
      <h3 className="text-lg font-semibold text-[#14213D]">{title}</h3>
      <p className="max-w-sm text-sm text-gray-500">{message}</p>
      {action}
    </div>
  );
}
