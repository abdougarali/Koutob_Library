"use client";

import { useState, useRef, useEffect } from "react";

type Option = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  label?: string;
  disabled?: boolean;
};

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "اختر...",
  className = "",
  label,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div className={`relative w-full ${className}`} ref={selectRef}>
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-foreground)] sm:mb-2 sm:text-sm">
          {label}
        </label>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && options.length > 0 && setIsOpen(!isOpen)}
        disabled={disabled || options.length === 0}
        className={`min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2.5 pr-10 text-right text-xs text-[color:var(--color-foreground)] transition focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-2 sm:text-sm ${
          !selectedOption ? "text-gray-400" : ""
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled || options.length === 0}
      >
        <span className="block truncate text-right">{displayText}</span>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen && !disabled && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[60vh] w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-xl sm:max-h-80"
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={`flex min-h-[44px] w-full items-center px-3 py-2.5 text-right text-xs transition sm:py-2 sm:text-sm ${
                  isSelected
                    ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
                    : "text-[color:var(--color-foreground)] active:bg-gray-100 hover:bg-gray-50"
                }`}
              >
                <span className="block w-full truncate text-right">
                  {option.label}
                </span>
                {isSelected && (
                  <svg
                    className="ml-2 h-4 w-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

