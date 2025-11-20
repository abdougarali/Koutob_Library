"use client";

import { useEffect, useState } from "react";
import { StarRating } from "./StarRating";

type Review = {
  _id: string;
  rating: number;
  comment?: string;
  verifiedPurchase: boolean;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

type ReviewsListProps = {
  bookSlug: string;
};

export function ReviewsList({ bookSlug }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [bookSlug]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/books/${encodeURIComponent(bookSlug)}/reviews`
      );
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-center text-gray-500">جاري تحميل التقييمات...</p>
      </div>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
        <p className="text-gray-600">لا توجد تقييمات بعد</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StarRating rating={stats.averageRating} size="lg" showValue />
              <span className="text-sm text-gray-600">
                ({stats.totalReviews} تقييم)
              </span>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingDistribution[star] || 0;
            const percentage = stats.totalReviews > 0 
              ? (count / stats.totalReviews) * 100 
              : 0;
            
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm text-gray-600">{star}</span>
                  <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-left">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          جميع التقييمات ({reviews.length})
        </h3>
        {reviews.map((review) => {
          const displayName =
            review.user?.name?.trim() ||
            review.user?.email?.split("@")[0] ||
            "مستخدم مجهول";

          return (
            <div
              key={review._id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {displayName}
                    </span>
                    {review.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        مشتري موثق
                      </span>
                    )}
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString("ar-TN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

















