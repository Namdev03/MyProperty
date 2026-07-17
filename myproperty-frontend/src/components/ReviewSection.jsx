import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Star } from "lucide-react";
import { addReview } from "../redux/slices/reviewSlice.js";
import { fetchPropertyById } from "../redux/slices/propertySlice.js";

export function ReviewSection({ property }) {
  const dispatch = useDispatch();
  const { isLoggedIn, role } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.review);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const reviews = property.reviews || [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn || role !== "user") {
      toast.info("Please log in as a user to leave a review");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    const result = await dispatch(addReview({ propertyId: property._id, rating, comment }));

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Review submitted successfully");
      setRating(0);
      setComment("");
      dispatch(fetchPropertyById(property._id)); // refresh reviews + average rating
    } else {
      toast.error(result.payload || "Failed to submit review");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-[#14213D]">Reviews</h2>
        {property.ratings > 0 && (
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <Star size={14} className="fill-[#B8863B] text-[#B8863B]" />
            {property.ratings} ({property.reviewsCount})
          </span>
        )}
      </div>

      {/* Existing reviews */}
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet. Be the first to share your experience.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="rounded-xl border border-[#E7E4DC] p-4">
              <div className="flex items-center gap-3">
                <img
                  src={
                    review.user?.profileImage?.url ||
                    "https://static.vecteezy.com/system/resources/previews/036/280/651/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"
                  }
                  alt={review.user?.fullName}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-[#14213D]">{review.user?.fullName}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={12}
                        className={n <= review.rating ? "fill-[#B8863B] text-[#B8863B]" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {review.comment && <p className="mt-2 text-sm text-gray-600">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Leave a review form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-[#E7E4DC] p-4">
        <p className="mb-2 text-sm font-medium text-gray-700">Leave a review</p>
        <div className="mb-3 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Rate ${n} stars`}
            >
              <Star
                size={24}
                className={
                  n <= (hoverRating || rating)
                    ? "fill-[#B8863B] text-[#B8863B]"
                    : "text-gray-300"
                }
              />
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this property..."
          className="mb-3 w-full rounded-lg border border-[#E7E4DC] px-3 py-2 text-sm outline-none focus:border-[#2F6844] focus:ring-2 focus:ring-[#2F6844]/15"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#14213D] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#2F6844] disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
