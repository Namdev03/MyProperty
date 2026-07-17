import { Link } from "react-router";
import { Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-6xl font-bold text-[#14213D]">404</p>
      <h1 className="mt-2 text-xl font-semibold text-[#14213D]">Page not found</h1>
      <p className="mt-2 text-gray-500">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="mt-6 flex items-center gap-2 rounded-full bg-[#14213D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F6844]"
      >
        <Home size={16} />
        Back to home
      </Link>
    </div>
  );
}
