import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { Loader } from "../components/Loader.jsx";
import { fetchPropertyById } from "../redux/slices/propertySlice";

const BookingPage = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const { current: property, loading } = useSelector((state) => state.property);

    useEffect(() => {
        dispatch(fetchPropertyById(id));
        // return () => dispatch(clearCurrentProperty());
    }, [dispatch, id]);
    // const handleBooking = async (e) => {
    //     e.preventDefault();

    //     if (!isLoggedIn || role !== "user") {
    //       toast.info("Please log in as a user to book this property");
    //       return;
    //     }
    //     if (!checkIn || !checkOut || nights <= 0) {
    //       toast.error("Please select valid check-in and check-out dates");
    //       return;
    //     }

    //     setSubmitting(true);
    //     const result = await dispatch(
    //       createBooking({
    //         propertyId: id,
    //         fullName: userProfile?.fullName,
    //         email: userProfile?.email,
    //         phone: userProfile?.mobile,
    //         checkIn,
    //         checkOut,
    //       })
    //     );
    //     setSubmitting(false);

    //     if (result.meta.requestStatus === "fulfilled") {
    //       toast.success("Booking request sent successfully!");
    //       setCheckIn("");
    //       setCheckOut("");
    //     } else {
    //       toast.error(result.payload || "Booking failed");
    //     }
    //   };
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        checkIn: "",
        checkOut: "",
    });

    const today = new Date().toISOString().split("T")[0];

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const booking = (e) => {
        e.preventDefault();
        console.log(formData);
    };
    if (loading || !property) {
        return <Loader fullScreen />;
    }
    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
                {/* Property Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <img
                        src={property?.propertyImages?.[0]?.url}
                        alt={property?.title}
                        className="w-full h-72 object-cover"
                    />

                    <div className="p-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">
                                    {property?.title}
                                </h2>

                                <p className="text-gray-500 mt-2">
                                    {property?.address}, {property?.city}, {property?.state}
                                </p>
                            </div>

                            <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold">
                                ₹{property?.price?.toLocaleString("en-IN")}
                                {property?.purpose === "Rent" && (
                                    <span className="text-sm font-normal"> / month</span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-8">
                            <div className="bg-gray-100 rounded-xl p-4 text-center">
                                <h3 className="font-bold text-lg">
                                    {property?.bedrooms}
                                </h3>
                                <p className="text-sm text-gray-500">Bedrooms</p>
                            </div>

                            <div className="bg-gray-100 rounded-xl p-4 text-center">
                                <h3 className="font-bold text-lg">
                                    {property?.bathrooms}
                                </h3>
                                <p className="text-sm text-gray-500">Bathrooms</p>
                            </div>

                            <div className="bg-gray-100 rounded-xl p-4 text-center">
                                <h3 className="font-bold text-lg">
                                    {property?.area?.value} {property?.area?.unit}
                                </h3>
                                <p className="text-sm text-gray-500">Area</p>
                            </div>
                        </div>

                        <p className="mt-8 text-gray-600 leading-7">
                            {property?.description}
                        </p>
                    </div>
                </div>

                {/* Booking Form */}

                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">
                            Book Property
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Fill in your details to reserve this property.
                        </p>
                    </div>

                    <form onSubmit={booking} className="space-y-6">
                        <div>
                            <label className="block mb-2 font-medium">Full Name</label>

                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">Email</label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@gmail.com"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">Phone Number</label>

                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="9876543210"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">Check In</label>

                            <input
                                type="date"
                                name="checkIn"
                                min={today}
                                value={formData.checkIn}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">Check Out</label>

                            <input
                                type="date"
                                name="checkOut"
                                min={formData.checkIn || today}
                                value={formData.checkOut}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="bg-blue-50 rounded-2xl p-5">
                            <div className="flex justify-between">
                                <span>Rent</span>
                                <span className="font-semibold">
                                    ₹{property?.price?.toLocaleString("en-IN")}
                                    {property?.purpose === "Rent" && "/month"}
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-4 rounded-xl"
                        >
                            Book Property
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;


//  <form onSubmit={handleBooking} className="mt-5 space-y-4">
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="mb-1 block text-xs font-medium text-gray-600">Check-in</label>
//                   <input
//                     type="date"
//                     value={checkIn}
//                     min={new Date().toISOString().split("T")[0]}
//                     onChange={(e) => setCheckIn(e.target.value)}
//                     className="w-full rounded-lg border border-[#E7E4DC] px-3 py-2 text-sm outline-none focus:border-[#2F6844]"
//                   />
//                 </div>
//                 <div>
//                   <label className="mb-1 block text-xs font-medium text-gray-600">Check-out</label>
//                   <input
//                     type="date"
//                     value={checkOut}
//                     min={checkIn || new Date().toISOString().split("T")[0]}
//                     onChange={(e) => setCheckOut(e.target.value)}
//                     className="w-full rounded-lg border border-[#E7E4DC] px-3 py-2 text-sm outline-none focus:border-[#2F6844]"
//                   />
//                 </div>
//               </div>

//               {nights > 0 && (
//                 <div className="flex items-center justify-between border-t border-[#E7E4DC] pt-3 text-sm">
//                   <span className="text-gray-500">{nights} night{nights > 1 ? "s" : ""}</span>
//                   <span className="font-semibold text-[#14213D]">
//                     ₹{totalPrice.toLocaleString("en-IN")}
//                   </span>
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 // disabled={submitting}
//                 className="w-full rounded-lg bg-[#14213D] py-3 text-sm font-semibold text-white transition hover:bg-[#2F6844] disabled:opacity-60"
//               >
//                 Book
//               </button>
//             </form>



//  const nights =
//     checkIn && checkOut
//       ? Math.max(
//           0,
//           Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
//         )
//       : 0;
//   const totalPrice = nights * (property?.price || 0);





//   const [checkIn, setCheckIn] = useState("");
//   const [checkOut, setCheckOut] = useState("");
//   const [submitting, setSubmitting] = useState(false);