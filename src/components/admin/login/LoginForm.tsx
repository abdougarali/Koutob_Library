"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/forms/PasswordInput";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        setLoading(false);
      } else {
        // Wait a bit for session to update, then redirect based on role
        setTimeout(() => {
          // Get the session to check role
          fetch("/api/auth/session")
            .then((res) => res.json())
            .then((data) => {
              const userRole = data?.user?.role;
              if (userRole === "admin") {
                router.push("/admin");
              } else if (userRole === "customer") {
                router.push("/dashboard");
              } else {
                // Fallback to admin if role is not determined
                router.push("/admin");
              }
              router.refresh();
            })
            .catch(() => {
              // Fallback redirect
              router.push("/admin");
              router.refresh();
            });
        }, 100);
      }
    } catch (err) {
      setError("حدث خطأ أثناء تسجيل الدخول");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]"
        >
          البريد الإلكتروني
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
          placeholder="admin@example.com"
        />
      </div>
      <PasswordInput
        id="password"
        label="كلمة المرور"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
        placeholder="••••••••"
      />
      <div className="flex items-center justify-between">
        <Link
          href="/forgot-password"
          className="text-sm text-[color:var(--color-primary)] hover:underline"
        >
          نسيت كلمة المرور؟
        </Link>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-xl bg-[color:var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
      </button>
    </form>
  );
}


