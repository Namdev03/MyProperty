const PROPERTY_TYPES = [
  "Apartment", "Hotel", "Villa", "House", "PG", "Office", "Shop", "Land", "Farm House",
];

export function FilterSidebar({ filters, onChange, onClear }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <aside className="w-full space-y-6 rounded-2xl border border-[#E7E4DC] bg-white p-5 lg:w-72">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#14213D]">Filters</h3>
        <button onClick={onClear} className="text-xs font-medium text-[#2F6844] hover:underline">
          Clear all
        </button>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Purpose</label>
        <div className="flex gap-2">
          {["Rent", "Sale"].map((p) => (
            <button
              key={p}
              onClick={() => set("purpose", filters.purpose === p ? "" : p)}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium transition ${
                filters.purpose === p
                  ? "border-[#14213D] bg-[#14213D] text-white"
                  : "border-[#E7E4DC] text-gray-600 hover:border-[#14213D]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Property Type</label>
        <select
          value={filters.propertyType || ""}
          onChange={(e) => set("propertyType", e.target.value)}
          className="w-full rounded-lg border border-[#E7E4DC] px-3 py-2 text-sm outline-none focus:border-[#2F6844]"
        >
          <option value="">All types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Price Range (₹)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) => set("minPrice", e.target.value)}
            className="w-full rounded-lg border border-[#E7E4DC] px-3 py-2 text-sm outline-none focus:border-[#2F6844]"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) => set("maxPrice", e.target.value)}
            className="w-full rounded-lg border border-[#E7E4DC] px-3 py-2 text-sm outline-none focus:border-[#2F6844]"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Bedrooms</label>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, "5+"].map((b) => (
            <button
              key={b}
              onClick={() => set("bedrooms", filters.bedrooms === b ? "" : b)}
              className={`h-9 min-w-9 rounded-lg border px-2 text-sm font-medium transition ${
                filters.bedrooms === b
                  ? "border-[#14213D] bg-[#14213D] text-white"
                  : "border-[#E7E4DC] text-gray-600 hover:border-[#14213D]"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">City</label>
        <input
          type="text"
          placeholder="e.g. Indore"
          value={filters.city || ""}
          onChange={(e) => set("city", e.target.value)}
          className="w-full rounded-lg border border-[#E7E4DC] px-3 py-2 text-sm outline-none focus:border-[#2F6844]"
        />
      </div>
    </aside>
  );
}
