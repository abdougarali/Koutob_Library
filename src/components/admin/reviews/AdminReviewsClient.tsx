"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { StarRating } from "@/components/reviews/StarRating";

type Review = {
  _id: string;
  book: {
    _id: string;
    slug: string;
    title: string;
  };
  user: {
    name: string;
    email: string;
  };
  rating: number;
  comment?: string;
  verifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
};

export function AdminReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      // We'll need to create an API endpoint to fetch all reviews
      // For now, we'll fetch from all books
      const response = await fetch(`/api/admin/reviews?filter=${filter}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews || []);
      } else {
        toast.error(data.error || "فشل في جلب التقييمات");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("حدث خطأ أثناء جلب التقييمات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isApproved: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل في الموافقة على التقييم");
      }

      toast.success("تم الموافقة على التقييم");
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isApproved: false }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل في رفض التقييم");
      }

      toast.success("تم رفض التقييم");
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التقييم؟")) {
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل في حذف التقييم");
      }

      toast.success("تم حذف التقييم");
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-gray-600">جاري تحميل التقييمات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === "pending"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          في الانتظار ({reviews.filter((r) => !r.isApproved).length})
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === "approved"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          الموافق عليها ({reviews.filter((r) => r.isApproved).length})
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === "all"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          الكل ({reviews.length})
        </button>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-600">لا توجد تقييمات</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2">
                    <a
                      href={`/books/${review.book.slug}`}
                      className="text-lg font-semibold text-primary hover:underline"
                    >
                      {review.book.title}
                    </a>
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <StarRating rating={review.rating} size="sm" />
                    {review.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        مشتري موثق
                      </span>
                    )}
                  </div>
                  <p className="mb-2 text-sm text-gray-600">
                    من: <span className="font-medium">{review.user.name}</span> (
                    {review.user.email})
                  </p>
                  {review.comment && (
                    <p className="mb-2 text-sm text-gray-700">{review.comment}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString("ar-TN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  {!review.isApproved ? (
                    <>
                      <button
                        onClick={() => handleApprove(review._id)}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                      >
                        موافقة
                      </button>
                      <button
                        onClick={() => handleReject(review._id)}
                        className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                      >
                        رفض
                      </button>
                    </>
                  ) : (
                    <span className="rounded-lg bg-green-100 px-4 py-2 text-center text-sm font-medium text-green-800">
                      موافق عليها
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

