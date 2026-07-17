import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { fetchProperties } from "../redux/slices/propertySlice.js";
import { PropertyCard } from "../components/PropertyCard.jsx";
import { PropertyGridSkeleton } from "../components/PropertySkeleton.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { Pagination } from "../components/Pagination.jsx";
import { FilterSidebar } from "../components/FilterSidebar.jsx";

export function PropertiesListing() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { list, pagination, loading } = useSelector((state) => state.property);

  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    page: 1,
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProperties(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (next) => {
    setFilters({ ...next, page: 1 });
  };

  const handleClearFilters = () => {
    setFilters({ q: filters.q, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters((f) => ({ ...f, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#14213D]">
            {filters.q ? `Results for "${filters.q}"` : "All Properties"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination.total} propert{pagination.total === 1 ? "y" : "ies"} found
          </p>
        </div>

        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 rounded-full border border-[#E7E4DC] px-4 py-2 text-sm font-medium text-[#14213D] lg:hidden"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
        </div>

        {/* Mobile filter drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-[#FEFDFB] p-5">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="mb-4 ml-auto flex rounded-full p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
              <FilterSidebar filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
            </div>
          </div>
        )}

        <div className="flex-1">
          {loading ? (
            <PropertyGridSkeleton count={9} />
          ) : list.length === 0 ? (
            <EmptyState
              title="No properties match your search"
              message="Try adjusting your filters or search a different city."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
