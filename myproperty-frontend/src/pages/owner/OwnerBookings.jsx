import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { CalendarX } from "lucide-react";
import { fetchOwnerBookings, cancelBooking } from "../../redux/slices/bookingSlice.js";
import { Loader } from "../../components/Loader.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700",
  Confirmed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Completed: "bg-gray-100 text-gray-700",
};

export function OwnerBookings() {
  const dispatch = useDispatch();
  const { ownerBookings, loading } = useSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchOwnerBookings());
  }, [dispatch]);

  const handleCancel = async (id) => {
    const result = await dispatch(cancelBooking(id));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Booking cancelled");
    } else {
      toast.error(result.payload || "Failed to cancel booking");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
      <h1 className="font-serif text-2xl font-bold text-[#14213D]">Bookings</h1>
      <p className="mt-1 mb-8 text-sm text-gray-500">All booking requests across your properties</p>

      {loading ? (
        <Loader />
      ) : ownerBookings.length === 0 ? (
        <EmptyState icon={CalendarX} title="No bookings yet" message="Bookings for your properties will show up here." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E7E4DC]">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Property</th>
                <th className="px-5 py-3 font-medium">Guest</th>
                <th className="px-5 py-3 font-medium">Dates</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E4DC]">
              {ownerBookings.map((b) => (
                <tr key={b._id}>
                  <td className="px-5 py-3 font-medium text-[#14213D]">{b.property?.title}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {b.user?.fullName}
                    <div className="text-xs text-gray-400">{b.user?.email}</div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 font-medium text-[#2F6844]">
                    ₹{b.totalPrice?.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[b.bookingStatus]}`}>
                      {b.bookingStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {["Pending", "Confirmed"].includes(b.bookingStatus) && (
                      <button
                        onClick={() => handleCancel(b._id)}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
