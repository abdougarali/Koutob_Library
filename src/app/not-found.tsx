import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 py-32 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-9xl font-bold text-[color:var(--color-primary)] opacity-20">
          404
        </div>
        <h1 className="text-4xl font-bold text-[color:var(--color-foreground)]">
          الصفحة غير موجودة
        </h1>
        <p className="max-w-md text-base text-[color:var(--color-foreground-muted)]">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/"
          className="rounded-xl bg-[color:var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          العودة للرئيسية
        </Link>
        <Link
          href="/books"
          className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-gray-50"
        >
          تصفح الكتب
        </Link>
      </div>
    </div>
  );
}






















