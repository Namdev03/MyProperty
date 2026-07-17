import { Link } from "react-router";
import { Heart, MapPin, BedDouble, Bath, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { toggleWishlist } from "../redux/slices/userSlice.js";

export function PropertyCard({ property }) {
  const dispatch = useDispatch();
  const { isLoggedIn, role } = useSelector((state) => state.auth);
  const wishlist = useSelector((state) => state.user.wishlist);

  const isWishlisted = wishlist?.some((p) => p._id === property._id);

  const handleWishlistClick = (e) => {
    e.preventDefault(); // don't navigate into the card's Link
    e.stopPropagation();

    if (!isLoggedIn || role !== "user") {
      toast.info("Please log in as a user to save properties");
      return;
    }

    dispatch(toggleWishlist({ propertyId: property._id, isWishlisted }))
      .unwrap()
      .then(() => {
        toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
      })
      .catch((err) => toast.error(err));
  };

  const heroImage = property.propertyImages?.[0]?.url;

  return (
    <Link
      to={`/properties/${property._id}`}
      className="group block overflow-hidden rounded-2xl border border-[#E7E4DC] bg-white transition duration-300 hover:shadow-lg"
    >
      <div className="relative h-48 w-full overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage}
            alt={property.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
            No image
          </div>
        )}

        <button
          onClick={handleWishlistClick}
          aria-label="Toggle wishlist"
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur transition hover:scale-110"
        >
          <Heart
            size={18}
            className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}
          />
        </button>

        <span className="absolute left-3 top-3 rounded-full bg-[#14213D]/90 px-3 py-1 text-xs font-medium text-white">
          For {property.purpose}
        </span>
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-[#14213D]">
            {property.title}
          </h3>
          {property.ratings > 0 && (
            <div className="flex shrink-0 items-center gap-1 text-sm text-gray-600">
              <Star size={14} className="fill-[#B8863B] text-[#B8863B]" />
              {property.ratings}
            </div>
          )}
        </div>

        <p className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin size={14} />
          {property.city}, {property.state}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble size={14} /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath size={14} /> {property.bathrooms}
            </span>
          )}
        </div>

        <p className="pt-1 font-semibold text-[#2F6844]">
          ₹{property.price?.toLocaleString("en-IN")}
          {property.purpose === "Rent" && (
            <span className="text-sm font-normal text-gray-500"> /month</span>
          )}
        </p>
      </div>
    </Link>
  );
}
