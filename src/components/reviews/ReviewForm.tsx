"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { StarRating } from "./StarRating";
import toast from "react-hot-toast";

type ReviewFormProps = {
  bookSlug: string;
  onReviewSubmitted?: () => void;
};

export function ReviewForm({ bookSlug, onReviewSubmitted }: ReviewFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-gray-600">
          يرجى{" "}
          <a href="/admin/login" className="text-primary hover:underline">
            تسجيل الدخول
          </a>{" "}
          لإضافة تقييم
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("يرجى اختيار تقييم");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/books/${encodeURIComponent(bookSlug)}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل في إضافة التقييم");
      }

      toast.success(data.message || "تم إرسال التقييم بنجاح");
      setRating(0);
      setComment("");
      onReviewSubmitted?.();
    } catch (error: any) {
      toast.error(error.message || "فشل في إضافة التقييم");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">أضف تقييمك</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          التقييم *
        </label>
        <StarRating
          rating={rating}
          interactive
          onRatingChange={setRating}
          size="lg"
        />
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          التعليق (اختياري)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={2000}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="شاركنا رأيك في هذا الكتاب..."
        />
        <p className="mt-1 text-xs text-gray-500">
          {comment.length} / 2000 حرف
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "جاري الإرسال..." : "إرسال التقييم"}
      </button>
    </form>
  );
}

