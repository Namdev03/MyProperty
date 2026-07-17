import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { fetchOwnerProperties, deleteProperty } from "../../redux/slices/propertySlice.js";
import { Loader } from "../../components/Loader.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";
import { Modal } from "../../components/Modal.jsx";

export function OwnerProperties() {
  const dispatch = useDispatch();
  const { ownerProperties, loading } = useSelector((state) => state.property);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchOwnerProperties());
  }, [dispatch]);

  const confirmDelete = async () => {
    setDeleting(true);
    const result = await dispatch(deleteProperty(deleteTarget._id));
    setDeleting(false);
    setDeleteTarget(null);

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Property deleted successfully");
    } else {
      toast.error(result.payload || "Failed to delete property");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-[#14213D]">My Properties</h1>
        <Link
          to="/owner/properties/add"
          className="flex items-center gap-2 rounded-full bg-[#14213D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F6844]"
        >
          <Plus size={16} />
          Add Property
        </Link>
      </div>

      {loading ? (
        <Loader />
      ) : ownerProperties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties listed yet"
          message="Add your first property to start receiving bookings."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E7E4DC]">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Property</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E4DC]">
              {ownerProperties.map((property) => (
                <tr key={property._id}>
                  <td className="flex items-center gap-3 px-5 py-3">
                    <img
                      src={property.propertyImages?.[0]?.url}
                      alt={property.title}
                      className="h-12 w-16 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-[#14213D]">{property.title}</p>
                      <p className="text-xs text-gray-500">{property.city}, {property.state}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{property.propertyType}</td>
                  <td className="px-5 py-3 font-medium text-[#2F6844]">
                    ₹{property.price?.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        property.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {property.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/owner/properties/${property._id}/edit`}
                        className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(property)}
                        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete property?"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete "{deleteTarget?.title}"? This will also remove all
          uploaded images and cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={() => setDeleteTarget(null)}
            className="rounded-lg border border-[#E7E4DC] px-4 py-2 text-sm font-medium text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
