import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import { fetchProperties } from "../redux/slices/propertySlice.js";
import { PropertyCard } from "../components/PropertyCard.jsx";
import { PropertyGridSkeleton } from "../components/PropertySkeleton.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { useState } from "react";

export function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading } = useSelector((state) => state.property);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchProperties({ limit: 8 }));
  }, [dispatch]);

  const handleSearch = () => {
    navigate(search.trim() ? `/properties?q=${encodeURIComponent(search.trim())}` : "/properties");
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#14213D] px-6 py-24 text-center text-white lg:px-8">
        <h1 className="mx-auto max-w-2xl font-serif text-4xl font-bold leading-tight sm:text-5xl">
          Find your perfect place to call home
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-white/70">
          Browse verified apartments, villas, PGs, and commercial spaces across the country.
        </p>

        <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full bg-white p-2 shadow-lg">
          <Search size={18} className="ml-2 shrink-0 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by city, locality, or property type..."
            className="w-full bg-transparent px-2 py-2 text-sm text-[#14213D] outline-none placeholder:text-gray-400"
          />
          <button
            onClick={handleSearch}
            className="shrink-0 rounded-full bg-[#2F6844] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#254f35]"
          >
            Search
          </button>
        </div>
      </section>

      {/* Featured properties */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#14213D]">Featured properties</h2>
            <p className="mt-1 text-sm text-gray-500">Hand-picked listings just for you</p>
          </div>
          <button
            onClick={() => navigate("/properties")}
            className="text-sm font-semibold text-[#2F6844] hover:underline"
          >
            View all →
          </button>
        </div>

        {loading ? (
          <PropertyGridSkeleton count={8} />
        ) : list.length === 0 ? (
          <EmptyState title="No properties yet" message="Check back soon for new listings." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
