import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { Building2, CalendarCheck, IndianRupee, TrendingUp, Plus } from "lucide-react";
import { fetchOwnerDashboardStats } from "../../redux/slices/ownerSlice.js";

export function OwnerDashboard() {
  const dispatch = useDispatch();
  const { stats, profile } = useSelector((state) => state.owner);

  useEffect(() => {
    dispatch(fetchOwnerDashboardStats());
  }, [dispatch]);

  const cards = [
    { label: "Total Properties", value: stats.totalProperties, icon: Building2 },
    { label: "Active Listings", value: stats.activeListings, icon: TrendingUp },
    { label: "Total Bookings", value: stats.totalBookings, icon: CalendarCheck },
    { label: "Revenue", value: `₹${stats.revenue?.toLocaleString("en-IN") || 0}`, icon: IndianRupee },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#14213D]">
            Welcome, {profile?.ownerName || "Owner"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{profile?.companyName}</p>
        </div>
        <Link
          to="/owner/properties/add"
          className="flex items-center gap-2 rounded-full bg-[#14213D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F6844]"
        >
          <Plus size={16} />
          Add Property
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-[#E7E4DC] bg-white p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#2F6844]/10">
              <card.icon size={20} className="text-[#2F6844]" />
            </div>
            <p className="text-2xl font-bold text-[#14213D]">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
