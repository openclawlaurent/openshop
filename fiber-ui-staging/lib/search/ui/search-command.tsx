"use client";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/lib/ui/overlay/command";
import type { MerchantCategory } from "@/lib/services/merchant-filters-client";
import type { AlgoliaMerchantRecord } from "@/types/algolia";
import * as LucideIcons from "lucide-react";
import { X, Store } from "lucide-react";
import { Button } from "@/lib/ui/data-display/button";
import Image from "next/image";

interface SearchCommandProps {
  value: string;
  onValueChange: (value: string) => void;
  onSearch: (query: string) => void;
  onCategorySelect: (categorySlug: string) => void;
  onMerchantSelect: (merchantName: string) => void;
  placeholder?: string;
  categories: MerchantCategory[];
  topMerchants: AlgoliaMerchantRecord[];
  loading?: boolean;
  className?: string;
  onMobileClick?: () => void; // Callback to open mobile search dialog
}

function getIconByName(iconName: string | null) {
  if (!iconName) return Store;
  const icon = (LucideIcons as Record<string, unknown>)[iconName];
  if (icon && typeof icon === "function") {
    return icon as React.ComponentType<{ className?: string }>;
  }
  return Store;
}

/**
 * Pure search command component with dropdown suggestions
 * Displays categories and top merchants when focused
 */
export function SearchCommand({
  value,
  onValueChange,
  onSearch,
  onCategorySelect,
  onMerchantSelect,
  placeholder,
  categories,
  topMerchants,
  loading = false,
  className,
  // onMobileClick,
}: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = useCallback(() => {
    setOpen(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        setOpen(false);
        onSearch(value);
      }
    },
    [value, onSearch],
  );

  const handleCategoryClick = useCallback(
    (categorySlug: string) => {
      setOpen(false);
      onCategorySelect(categorySlug);
    },
    [onCategorySelect],
  );

  const handleMerchantClick = useCallback(
    (merchantName: string) => {
      setOpen(false);
      onMerchantSelect(merchantName);
    },
    [onMerchantSelect],
  );

  const renderCategoryItem = useCallback(
    (category: MerchantCategory) => {
      const Icon = getIconByName(category.icon_name);
      return (
        <CommandItem
          key={category.id}
          value={category.label}
          onSelect={() => handleCategoryClick(category.slug)}
          className="cursor-pointer"
        >
          <Icon className="mr-2 h-4 w-4" />
          <span>{category.label}</span>
        </CommandItem>
      );
    },
    [handleCategoryClick],
  );

  const renderMerchantItem = useCallback(
    (merchant: AlgoliaMerchantRecord) => {
      const cashbackText =
        merchant.maxRateType === "percentage"
          ? `${merchant.maxRateAmount}% back`
          : `$${merchant.maxRateAmount} back`;

      return (
        <CommandItem
          key={merchant.objectID}
          value={merchant.merchantName}
          onSelect={() => handleMerchantClick(merchant.merchantName)}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              {merchant.logoUrl && (
                <div className="relative mr-2 h-5 w-5 flex-shrink-0">
                  <Image
                    src={merchant.logoUrl}
                    alt={merchant.merchantName}
                    fill
                    className="object-contain rounded"
                  />
                </div>
              )}
              <span>{merchant.merchantName}</span>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium ml-2">
              {cashbackText}
            </span>
          </div>
        </CommandItem>
      );
    },
    [handleMerchantClick],
  );

  const renderContent = useMemo(() => {
    // If user has typed anything, show search message with highlighted term
    if (value.trim().length > 0) {
      return (
        <div className="p-4 text-center text-sm text-muted-foreground">
          Press Enter to search for{" "}
          <span className="font-medium text-foreground bg-accent px-1.5 py-0.5 rounded">
            {value.trim()}
          </span>
        </div>
      );
    }

    // If loading, show loading state
    if (loading) {
      return <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>;
    }

    // Show both categories and top merchants
    return (
      <>
        {topMerchants.length > 0 && (
          <CommandGroup heading="Top Merchants">
            {topMerchants.map(renderMerchantItem)}
          </CommandGroup>
        )}
        {categories.length > 0 && (
          <CommandGroup heading="Browse by Category">
            {categories.map(renderCategoryItem)}
          </CommandGroup>
        )}
        {categories.length === 0 && topMerchants.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">No results available</div>
        )}
      </>
    );
  }, [value, categories, topMerchants, loading, renderCategoryItem, renderMerchantItem]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onValueChange("");
      setOpen(false);
    },
    [onValueChange],
  );

  const handleWrapperClick = useCallback(() => {
    // Find and focus the input element when wrapper is clicked
    const input = inputWrapperRef.current?.querySelector("input");
    if (input) {
      input.focus();
    }
  }, []);

  return (
    <div className={`relative w-full max-w-3xl ${className || ""}`} ref={commandRef}>
      <Command className="rounded-xl border-2 shadow-lg">
        <div className="relative" ref={inputWrapperRef} onClick={handleWrapperClick}>
          <CommandInput
            placeholder={placeholder}
            value={value}
            onValueChange={onValueChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
          />
          {value && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full hover:bg-muted"
              onClick={handleClear}
              type="button"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </Command>

      {/* Dropdown positioned outside Command to avoid overflow-hidden clipping */}
      {open && !isMobile && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2">
          <Command className="rounded-xl border-2 bg-popover shadow-xl">
            <CommandList className="max-h-[400px] overflow-auto">{renderContent}</CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
