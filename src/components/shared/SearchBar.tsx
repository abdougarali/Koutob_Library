"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type SearchBarProps = {
  placeholder?: string;
  basePath?: string;
};

type AutocompleteResult = {
  slug: string;
  title: string;
  author: string;
  imageUrl: string;
};

export function SearchBar({
  placeholder = "ابحث عن كتاب، مؤلف، أو كلمة مفتاحية...",
  basePath = "/books",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [isPending, startTransition] = useTransition();
  const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get or create session ID for anonymous users
  useEffect(() => {
    const storedSessionId = localStorage.getItem("searchSessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("searchSessionId", newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  // Load recent and popular searches on mount
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const [recentRes, popularRes] = await Promise.all([
          fetch(`/api/search/recent?limit=5`, {
            headers: sessionId ? { "x-session-id": sessionId } : {},
          }),
          fetch(`/api/search/popular?limit=5`),
        ]);

        if (recentRes.ok) {
          const recentData = await recentRes.json();
          if (recentData.success) {
            setRecentSearches(recentData.searches || []);
          }
        }

        if (popularRes.ok) {
          const popularData = await popularRes.json();
          if (popularData.success) {
            setPopularSearches(popularData.searches || []);
          }
        }
      } catch (error) {
        console.error("Failed to load search suggestions:", error);
      }
    };

    loadSuggestions();
  }, [sessionId]);

  // Debounced autocomplete search
  const fetchAutocomplete = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setAutocompleteResults([]);
      return;
    }

    setIsLoadingAutocomplete(true);
    try {
      const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}&limit=8`);
      const data = await response.json();
      if (data.success) {
        setAutocompleteResults(data.results || []);
      }
    } catch (error) {
      console.error("Autocomplete error:", error);
      setAutocompleteResults([]);
    } finally {
      setIsLoadingAutocomplete(false);
    }
  }, []);

  // Handle input change with debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        fetchAutocomplete(searchQuery);
      }, 300);
    } else {
      setAutocompleteResults([]);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, fetchAutocomplete]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Log search
  const logSearch = async (query: string, clickedBookId?: string) => {
    try {
      await fetch("/api/search/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          sessionId: sessionId || undefined,
          clickedBookId: clickedBookId || undefined,
        }),
      });
    } catch (error) {
      // Silently fail
      console.error("Failed to log search:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent, query?: string) => {
    e.preventDefault();
    const finalQuery = (query || searchQuery).trim();
    
    if (finalQuery) {
      await logSearch(finalQuery);
    }

    setShowDropdown(false);
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (finalQuery) {
        params.set("search", finalQuery);
      } else {
        params.delete("search");
      }
      
      params.delete("page");
      router.push(`${basePath}?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearchQuery("");
    setAutocompleteResults([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    
    startTransition(() => {
      router.push(`${basePath}?${params.toString()}`);
    });
  };

  const handleSuggestionClick = async (suggestion: string | AutocompleteResult) => {
    if (typeof suggestion === "string") {
      // Recent/popular search query
      setSearchQuery(suggestion);
      await handleSearch(new Event("submit") as any, suggestion);
    } else {
      // Autocomplete book result
      await logSearch(searchQuery, suggestion.slug);
      setShowDropdown(false);
      router.push(`/books/${suggestion.slug}`);
    }
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const hasSuggestions = 
    (searchQuery.trim().length >= 2 && autocompleteResults.length > 0) ||
    (searchQuery.trim().length === 0 && (recentSearches.length > 0 || popularSearches.length > 0));

  return (
    <div className="relative w-full">
      <form onSubmit={(e) => handleSearch(e)} className="relative w-full">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-[color:var(--color-foreground)] placeholder:text-[color:var(--color-foreground-muted)] focus:border-[color:var(--color-primary)] focus:outline-none"
            dir="rtl"
          />
          <div className="absolute left-3 flex items-center gap-2">
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="مسح البحث"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full p-1 text-[color:var(--color-primary)] transition hover:bg-[color:var(--color-surface-muted)] disabled:opacity-50"
              aria-label="بحث"
            >
              {isPending ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--color-primary)] border-t-transparent" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && hasSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-50 mt-0.5 w-full max-h-[55vh] overflow-y-auto rounded-md border border-gray-200 bg-white shadow-xl sm:mt-2 sm:max-h-96 sm:rounded-xl"
          dir="rtl"
        >
          {searchQuery.trim().length >= 2 ? (
            // Autocomplete results
            <div className="max-h-[55vh] overflow-y-auto sm:max-h-96">
              {isLoadingAutocomplete ? (
                <div className="flex items-center justify-center py-4 sm:py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--color-primary)] border-t-transparent sm:h-6 sm:w-6" />
                </div>
              ) : autocompleteResults.length > 0 ? (
                <>
                  <div className="border-b border-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500 sm:px-4 sm:py-2 sm:text-xs">
                    نتائج البحث
                  </div>
                  {autocompleteResults.map((book) => (
                    <button
                      key={book.slug}
                      type="button"
                      onClick={() => handleSuggestionClick(book)}
                      className="flex min-h-[52px] w-full items-center gap-1.5 border-b border-gray-50 px-2.5 py-2.5 text-right transition active:bg-gray-100 hover:bg-gray-50 sm:min-h-0 sm:gap-3 sm:px-4 sm:py-3"
                    >
                      <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-md sm:h-12 sm:w-12 sm:rounded-lg">
                        <Image
                          src={book.imageUrl}
                          alt={book.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 text-right min-w-0">
                        <div className="text-xs font-medium leading-tight text-[color:var(--color-foreground)] line-clamp-2 sm:text-base sm:leading-normal">
                          {book.title}
                        </div>
                        <div className="mt-0.5 text-[10px] leading-tight text-[color:var(--color-foreground-muted)] line-clamp-1 sm:mt-1 sm:text-sm sm:leading-normal">
                          {book.author}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-3 py-6 text-center text-xs text-[color:var(--color-foreground-muted)] sm:px-4 sm:py-8 sm:text-sm">
                  لا توجد نتائج
                </div>
              )}
            </div>
          ) : (
            // Recent and Popular searches
            <div className="max-h-[55vh] overflow-y-auto sm:max-h-96">
              {recentSearches.length > 0 && (
                <>
                  <div className="border-b border-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500 sm:px-4 sm:py-2 sm:text-xs">
                    عمليات البحث الأخيرة
                  </div>
                  {recentSearches.map((query, index) => (
                    <button
                      key={`recent-${index}`}
                      type="button"
                      onClick={() => handleSuggestionClick(query)}
                      className="flex min-h-[44px] w-full items-center gap-2 border-b border-gray-50 px-3 py-2.5 text-right transition active:bg-gray-100 hover:bg-gray-50 sm:px-4 sm:py-2.5"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-4 w-4 flex-shrink-0 text-gray-400 sm:h-5 sm:w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span className="flex-1 text-xs text-[color:var(--color-foreground)] truncate text-right sm:text-base">{query}</span>
                    </button>
                  ))}
                </>
              )}
              {popularSearches.length > 0 && (
                <>
                  <div className="border-b border-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500 sm:px-4 sm:py-2 sm:text-xs">
                    الأكثر بحثاً
                  </div>
                  {popularSearches.map((query, index) => (
                    <button
                      key={`popular-${index}`}
                      type="button"
                      onClick={() => handleSuggestionClick(query)}
                      className="flex min-h-[44px] w-full items-center gap-2 border-b border-gray-50 px-3 py-2.5 text-right transition active:bg-gray-100 hover:bg-gray-50 sm:px-4 sm:py-2.5"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-4 w-4 flex-shrink-0 text-[color:var(--color-primary)] sm:h-5 sm:w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                      </svg>
                      <span className="flex-1 text-xs text-[color:var(--color-foreground)] truncate text-right sm:text-base">{query}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
