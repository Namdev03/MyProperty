import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart } from "lucide-react";
import { fetchWishlist } from "../../redux/slices/userSlice.js";
import { PropertyCard } from "../../components/PropertyCard.jsx";
import { PropertyGridSkeleton } from "../../components/PropertySkeleton.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";

export function Wishlist() {
  const dispatch = useDispatch();
  const { wishlist, loading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <h1 className="font-serif text-2xl font-bold text-[#14213D]">My Wishlist</h1>
      <p className="mt-1 mb-8 text-sm text-gray-500">Properties you've saved for later</p>

      {loading ? (
        <PropertyGridSkeleton count={6} />
      ) : wishlist.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          message="Tap the heart icon on any property to save it here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
