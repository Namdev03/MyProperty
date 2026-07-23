import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Loader } from "../components/Loader.jsx";
import { fetchPropertyById, clearCurrentProperty } from "../redux/slices/propertySlice.js";
import { createBooking } from "../redux/slices/bookingSlice.js";

const BookingPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { current: property, loading } = useSelector((state) => state.property);
    const { isLoggedIn, role } = useSelector((state) => state.auth);
    const userProfile = useSelector((state) => state.user.profile);

    const [submitting, setSubmitting] = useState(false);

    // Single source of truth for the whole form, including dates —
    // no separate checkIn/checkOut state to drift out of sync with this.
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        // checkIn: "",
        // checkOut: "",
    });

    useEffect(() => {
        dispatch(fetchPropertyById(id));
        return () => dispatch(clearCurrentProperty());
    }, [dispatch, id]);

    // Prefill from the logged-in user's profile so they don't retype it
    useEffect(() => {
        if (userProfile) {
            setFormData((prev) => ({
                ...prev,
                fullName: prev.fullName || userProfile.fullName || "",
                email: prev.email || userProfile.email || "",
                phone: prev.phone || userProfile.mobile || "",
            }));
        }
    }, [userProfile]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // const nights =
    //     formData.checkIn && formData.checkOut
    //         ? Math.max(
    //             0,
    //             Math.ceil(
    //                 (new Date(formData.checkOut) - new Date(formData.checkIn)) /
    //                 (1000 * 60 * 60 * 24)
    //             )
    //         )
    //         : 0;

    // const totalPrice = nights * (property?.price || 0);

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!isLoggedIn || role !== "user") {
            toast.info("Please log in as a user to book this property");
            return;
        }

        if (!formData.fullName || !formData.email || !formData.phone) {
            toast.error("Please fill in your name, email, and phone number");
            return;
        }

        // if (!formData.checkIn || !formData.checkOut || nights <= 0) {
        //     toast.error("Please select valid check-in and check-out dates");
        //     return;
        // }

        setSubmitting(true);
        const result = await dispatch(
            createBooking({
                propertyId: id,
                formData
            })
        );
        setSubmitting(false);

        if (result.meta.requestStatus === "fulfilled") {
            toast.success("Booking request sent successfully!");
            navigate("/dashboard");
        } else {
            toast.error(result.payload || "Booking failed");
        }
    };

    // const today = new Date().toISOString().split("T")[0];

    if (loading || !property) {
        return <Loader fullScreen />;
    }
    return (
        <div className="min-h-screen bg-slate-100 px-4 py-10">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
                {/* Property Card */}
                <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
                    <img
                        src={property?.propertyImages?.[0]?.url}
                        alt={property?.title}
                        className="h-72 w-full object-cover"
                    />

                    <div className="p-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">{property?.title}</h2>
                                <p className="mt-2 text-gray-500">
                                    {property?.address}, {property?.city}, {property?.state}
                                </p>
                            </div>

                            <div className="shrink-0 rounded-xl bg-[#14213D] px-4 py-2 font-semibold text-white">
                                ₹{property?.price?.toLocaleString("en-IN")}
                                {property?.purpose === "Rent" && <span className="text-sm font-normal"> / month</span>}
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-3 gap-4">
                            <div className="rounded-xl bg-gray-100 p-4 text-center">
                                <h3 className="text-lg font-bold">{property?.bedrooms}</h3>
                                <p className="text-sm text-gray-500">Bedrooms</p>
                            </div>
                            <div className="rounded-xl bg-gray-100 p-4 text-center">
                                <h3 className="text-lg font-bold">{property?.bathrooms}</h3>
                                <p className="text-sm text-gray-500">Bathrooms</p>
                            </div>
                            <div className="rounded-xl bg-gray-100 p-4 text-center">
                                <h3 className="text-lg font-bold">
                                    {property?.area?.value} {property?.area?.unit}
                                </h3>
                                <p className="text-sm text-gray-500">Area</p>
                            </div>
                        </div>

                        <p className="mt-8 leading-7 text-gray-600">{property?.description}</p>
                    </div>
                </div>

                {/* Booking Form */}
                <div className="rounded-3xl bg-white p-8 shadow-xl">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">Book Property</h2>
                        <p className="mt-2 text-gray-500">Fill in your details to reserve this property.</p>
                    </div>

                    <form onSubmit={handleBooking} className="space-y-6">
                        <div>
                            <label className="mb-2 block font-medium">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#2F6844]/40 focus:border-[#2F6844]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@gmail.com"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#2F6844]/40 focus:border-[#2F6844]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="9876543210"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#2F6844]/40 focus:border-[#2F6844]"
                            />
                        </div>

                        {/* <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block font-medium">Check In</label>
                                <input
                                    type="date"
                                    name="checkIn"
                                    min={today}
                                    value={formData.checkIn}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#2F6844]/40 focus:border-[#2F6844]"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block font-medium">Check Out</label>
                                <input
                                    type="date"
                                    name="checkOut"
                                    min={formData.checkIn || today}
                                    value={formData.checkOut}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#2F6844]/40 focus:border-[#2F6844]"
                                />
                            </div>
                        </div> */}

                        <div className="rounded-2xl bg-[#2F6844]/5 p-5">
                            <div className="flex justify-between">
                                <span>Rent</span>
                                <span className="font-semibold">
                                    ₹{property?.price?.toLocaleString("en-IN")}
                                    {property?.purpose === "Rent" && "/month"}
                                </span>
                            </div>

                            {/* {nights > 0 && (
                                <>
                                    <div className="mt-2 flex justify-between text-sm text-gray-600">
                                        <span>{nights} night{nights > 1 ? "s" : ""}</span>
                                        <span>× ₹{property?.price?.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="mt-2 flex justify-between border-t border-[#2F6844]/20 pt-2 font-bold text-[#14213D]">
                                        <span>Total</span>
                                        <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                                    </div>
                                </>
                            )} */}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-xl bg-[#14213D] py-4 font-semibold text-white transition hover:bg-[#2F6844] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Booking..." : "Book Property"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;