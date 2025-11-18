export function BookCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[rgba(184,138,68,0.16)] bg-white p-4 shadow-sm">
      {/* Image skeleton */}
      <div className="relative h-48 w-full overflow-hidden rounded-xl bg-gray-200 animate-pulse" />
      
      {/* Content skeleton */}
      <div className="flex flex-col gap-1">
        <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
        <div className="h-6 w-full rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
      </div>
      
      {/* Price and button skeleton */}
      <div className="mt-1 flex items-center justify-between">
        <div className="h-6 w-16 rounded bg-gray-200 animate-pulse" />
        <div className="h-9 w-24 rounded-lg bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}






















