"use client";

export function PrintButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`rounded-xl border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-[color:var(--color-foreground)] transition hover:bg-gray-50 ${className}`}
    >
      طباعة
    </button>
  );
}










