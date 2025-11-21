"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "./PasswordInput";
import toast from "react-hot-toast";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمات المرور غير متطابقة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token, // Token is already decoded in the page component
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setErrors({ submit: data.error || "تم تجاوز عدد المحاولات المسموح بها" });
          toast.error(data.error || "تم تجاوز عدد المحاولات المسموح بها");
        } else {
          setErrors({ submit: data.error || "فشل في إعادة تعيين كلمة المرور" });
          toast.error(data.error || "فشل في إعادة تعيين كلمة المرور");
        }
        return;
      }

      // Success – ensure any existing session is cleared before redirecting
      toast.success("تم إعادة تعيين كلمة المرور بنجاح");
      try {
        await signOut({ redirect: false });
      } catch (err) {
        console.warn("Reset password: failed to sign out existing session", err);
      }
      router.push("/admin/login");
    } catch (error) {
      console.error("Reset password error:", error);
      setErrors({ submit: "حدث خطأ غير متوقع" });
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Password */}
      <div>
        <PasswordInput
          id="password"
          name="password"
          label="كلمة المرور الجديدة"
          value={formData.password}
          onChange={handleChange}
          required
          className={`w-full rounded-lg border px-4 py-3 text-sm transition ${
            errors.password
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
          }`}
          placeholder="6 أحرف على الأقل"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="تأكيد كلمة المرور"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className={`w-full rounded-lg border px-4 py-3 text-sm transition ${
            errors.confirmPassword
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
          }`}
          placeholder="أعد إدخال كلمة المرور"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {errors.submit}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-[color:var(--color-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "جاري الحفظ..." : "إعادة تعيين كلمة المرور"}
      </button>
    </form>
  );
}

