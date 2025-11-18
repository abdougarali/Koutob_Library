type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-[color:var(--color-surface-muted)] border-t-[color:var(--color-primary)]`}
        role="status"
        aria-label="جاري التحميل"
      >
        <span className="sr-only">جاري التحميل...</span>
      </div>
    </div>
  );
}






















