import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login/LoginForm";

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    // Redirect based on role
    if (session.user.role === "admin") {
      redirect("/admin");
    } else if (session.user.role === "customer") {
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-[color:var(--color-foreground)]">
          تسجيل الدخول
        </h1>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-[color:var(--color-foreground-muted)]">
          ليس لديك حساب؟{" "}
          <Link
            href="/signup"
            className="font-medium text-[color:var(--color-primary)] hover:underline"
          >
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  );
}



