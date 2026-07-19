import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  MapPin, BedDouble, Bath, Home as HomeIcon, Layers, Star, Check,
} from "lucide-react";
import { fetchPropertyById, clearCurrentProperty } from "../redux/slices/propertySlice.js";
import { createBooking } from "../redux/slices/bookingSlice.js";
import { PropertyGallery } from "../components/PropertyGallery.jsx";
import { ReviewSection } from "../components/ReviewSection.jsx";
import { Loader } from "../components/Loader.jsx";
import { pagePath } from "../routes/pagePath.js";

export function PropertyDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: property, loading } = useSelector((state) => state.property);
  const { isLoggedIn, role } = useSelector((state) => state.auth);
  const userProfile = useSelector((state) => state.user.profile); 
  
  useEffect(() => {
    dispatch(fetchPropertyById(id));
    return () => dispatch(clearCurrentProperty());
  }, [dispatch, id]);
  if (loading || !property) {
    return <Loader fullScreen />;
  }
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <PropertyGallery property={property} />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left: details */}
        <div className="space-y-6 lg:col-span-2">
          <div>
            <span className="rounded-full bg-[#2F6844]/10 px-3 py-1 text-xs font-semibold text-[#2F6844]">
              For {property.purpose}
            </span>
            <h1 className="mt-3 font-serif text-3xl font-bold text-[#14213D]">
              {property.title}
            </h1>
            <p className="mt-2 flex items-center gap-1 text-gray-500">
              <MapPin size={16} />
              {property.address}, {property.city}, {property.state}, {property.country}
            </p>
            {property.ratings > 0 && (
              <p className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                <Star size={16} className="fill-[#B8863B] text-[#B8863B]" />
                {property?.ratings} ({property.reviewsCount} reviews)
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[#E7E4DC] p-5 sm:grid-cols-4">
            <Stat icon={BedDouble} label="Bedrooms" value={property.bedrooms} />
            <Stat icon={Bath} label="Bathrooms" value={property.bathrooms} />
            <Stat icon={Layers} label="Area" value={`${property.area?.value || "-"} ${property.area?.unit || ""}`} />
            <Stat icon={HomeIcon} label="Furnishing" value={property.furnished} />
          </div>

          <div>
            <h2 className="mb-2 font-semibold text-[#14213D]">Description</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
              {property.description}
            </p>
          </div>

          {property.amenities?.length > 0 && (
            <div>
              <h2 className="mb-3 font-semibold text-[#14213D]">Amenities</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {property.amenities.map((a) => (
                  <span key={a} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={14} className="text-[#2F6844]" />
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {property.owner && (
            <div className="flex items-center gap-3 rounded-2xl border border-[#E7E4DC] p-4">
              {property.owner.companyLogo?.url && (
                <img
                  src={property.owner.companyLogo.url}
                  alt={property.owner.companyName}
                  className="h-12 w-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-[#14213D]">{property.owner.companyName}</p>
                <p className="text-sm text-gray-500">Listed by {property.owner.ownerName}</p>
              </div>
            </div>
          )}
          <ReviewSection property={property} />
        </div>
        {/* Right: booking card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-[#E7E4DC] p-6 shadow-sm">
            <p className="text-2xl font-bold text-[#2F6844]">
              ₹{property.price?.toLocaleString("en-IN")}
              {property.purpose === "Rent" && (
                <span className="text-sm font-normal text-gray-500"> /month</span>
              )}
            </p>

            <Link to={`${pagePath.BOOKIN}/${id}`}>
              Book
            </Link >
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col items-center text-center">
      <Icon size={20} className="mb-1 text-[#2F6844]" />
      <span className="text-sm font-semibold text-[#14213D]">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
