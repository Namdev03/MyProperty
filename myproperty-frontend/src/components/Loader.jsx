import { Loader2 } from "lucide-react";

export function Loader({ fullScreen = false, label = "Loading..." }) {
  if (fullScreen) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-[#FEFDFB]">
        <Loader2 className="animate-spin text-[#2F6844]" size={36} />
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-10">
      <Loader2 className="animate-spin text-[#2F6844]" size={24} />
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}
