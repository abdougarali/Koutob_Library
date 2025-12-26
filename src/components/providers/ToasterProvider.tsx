"use client";

import { Toaster } from "react-hot-toast";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        className: "",
        duration: 4000,
        style: {
          background: "#fff",
          color: "#333",
          fontFamily: "var(--font-tajawal), var(--font-cairo), sans-serif",
          direction: "rtl",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        },
        // Success toast
        success: {
          duration: 5000,
          iconTheme: {
            primary: "#0a6e5c",
            secondary: "#fff",
          },
          style: {
            background: "#f0fdf4",
            color: "#166534",
            border: "1px solid #86efac",
          },
        },
        // Error toast
        error: {
          duration: 6000,
          iconTheme: {
            primary: "#dc2626",
            secondary: "#fff",
          },
          style: {
            background: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #fca5a5",
          },
        },
      }}
    />
  );
}








