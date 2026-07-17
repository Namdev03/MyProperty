import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { CalendarX, MapPin } from "lucide-react";
import { fetchUserBookings, cancelBooking } from "../../redux/slices/bookingSlice.js";
import { Loader } from "../../components/Loader.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700",
  Confirmed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Completed: "bg-gray-100 text-gray-700",
};

export function UserDashboard() {
  const dispatch = useDispatch();
  const { userBookings, loading } = useSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchUserBookings());
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
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
      <h1 className="font-serif text-2xl font-bold text-[#14213D]">My Bookings</h1>
      <p className="mt-1 mb-8 text-sm text-gray-500">Track and manage your property bookings</p>

      {loading ? (
        <Loader />
      ) : userBookings.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No bookings yet"
          message="Once you book a property, it'll show up here."
        />
      ) : (
        <div className="space-y-4">
          {userBookings.map((booking) => (
            <div
              key={booking._id}
              className="flex flex-col gap-4 rounded-2xl border border-[#E7E4DC] p-5 sm:flex-row sm:items-center"
            >
              <img
                src={booking.property?.propertyImages?.[0]?.url}
                alt={booking.property?.title}
                className="h-24 w-full rounded-xl object-cover sm:w-32"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-[#14213D]">{booking.property?.title}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[booking.bookingStatus]}`}
                  >
                    {booking.bookingStatus}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin size={14} />
                  {booking.property?.city}, {booking.property?.state}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(booking.checkIn).toLocaleDateString()} —{" "}
                  {new Date(booking.checkOut).toLocaleDateString()}
                </p>
                <p className="mt-1 font-semibold text-[#2F6844]">
                  ₹{booking.totalPrice?.toLocaleString("en-IN")}
                </p>
              </div>

              {["Pending", "Confirmed"].includes(booking.bookingStatus) && (
                <button
                  onClick={() => handleCancel(booking._id)}
                  className="shrink-0 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
