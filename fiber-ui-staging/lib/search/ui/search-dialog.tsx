"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/lib/ui/overlay/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/lib/ui/overlay/command";
import { Search, X, Store } from "lucide-react";
import type { MerchantCategory } from "@/lib/services/merchant-filters-client";
import type { AlgoliaMerchantRecord } from "@/types/algolia";
import * as LucideIcons from "lucide-react";
import { Button } from "@/lib/ui/data-display/button";
import Image from "next/image";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onSearch: (query: string) => void;
  onCategorySelect: (categorySlug: string) => void;
  onMerchantSelect: (merchantName: string) => void;
  categories: MerchantCategory[];
  topMerchants: AlgoliaMerchantRecord[];
  loading?: boolean;
  className?: string;
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
 * Mobile search dialog component
 * Pure UI component that displays a fullscreen search dialog
 */
export function SearchDialog({
  open,
  onOpenChange,
  searchValue,
  onSearchValueChange,
  onSearch,
  onCategorySelect,
  onMerchantSelect,
  categories,
  topMerchants,
  loading = false,
  className,
}: SearchDialogProps) {
  const handleCategoryClick = React.useCallback(
    (categorySlug: string) => {
      onCategorySelect(categorySlug);
      onOpenChange(false);
    },
    [onCategorySelect, onOpenChange],
  );

  const handleMerchantClick = React.useCallback(
    (merchantName: string) => {
      onMerchantSelect(merchantName);
      onOpenChange(false);
    },
    [onMerchantSelect, onOpenChange],
  );

  const handleSearchClick = React.useCallback(
    (query: string) => {
      onSearch(query);
      onOpenChange(false);
    },
    [onSearch, onOpenChange],
  );

  const renderCategoryItem = React.useCallback(
    (category: MerchantCategory) => {
      const Icon = getIconByName(category.icon_name);
      return (
        <CommandItem
          key={category.id}
          value={category.label}
          onSelect={() => handleCategoryClick(category.slug)}
          className="cursor-pointer h-12 md:h-auto"
        >
          <Icon className="mr-2 h-4 w-4" />
          <span>{category.label}</span>
        </CommandItem>
      );
    },
    [handleCategoryClick],
  );

  const renderMerchantItem = React.useCallback(
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
          className="cursor-pointer h-12 md:h-auto"
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

  const renderSearchContent = React.useMemo(() => {
    const query = searchValue.trim();

    if (query.length > 0) {
      // Show search option when there's a query
      return (
        <CommandGroup key="search-option" heading="Search">
          <CommandItem
            key="search-term"
            value={`search:${query}`}
            onSelect={() => handleSearchClick(query)}
            className="cursor-pointer h-12 md:h-auto"
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search for &ldquo;{query}&rdquo;</span>
          </CommandItem>
        </CommandGroup>
      );
    }

    // If empty, show browseable categories
    if (loading) {
      return <div className="py-6 text-center text-sm text-muted-foreground">Loading...</div>;
    }

    if (categories.length === 0 && topMerchants.length === 0) {
      return (
        <div className="py-6 text-center text-sm text-muted-foreground">No results available</div>
      );
    }

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
      </>
    );
  }, [
    searchValue,
    categories,
    topMerchants,
    loading,
    renderCategoryItem,
    renderMerchantItem,
    handleSearchClick,
  ]);

  // Auto-focus input when dialog opens
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      // Small delay to ensure dialog is fully rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Reset search value when dialog closes
      onSearchValueChange("");
    }
  }, [open, onSearchValueChange]);

  const handleClear = React.useCallback(() => {
    onSearchValueChange("");
  }, [onSearchValueChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`overflow-hidden p-0 gap-0 flex flex-col h-[100dvh] w-full max-w-none top-0 translate-y-0 border-0 rounded-none sm:h-auto sm:max-w-lg sm:top-[50%] sm:translate-y-[-50%] sm:rounded-lg sm:border ${className || ""}`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search Offers</DialogTitle>
          <DialogDescription>Search for merchants and offers</DialogDescription>
        </DialogHeader>

        <Command className="rounded-lg border-0 flex-1 flex flex-col" shouldFilter={false}>
          <div className="relative">
            <CommandInput
              ref={inputRef}
              placeholder="Search offers"
              value={searchValue}
              onValueChange={onSearchValueChange}
              className="h-16 md:h-14 text-base"
              data-testid="search-input"
              autoFocus
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-muted hidden sm:flex"
                onClick={handleClear}
                type="button"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
          <CommandList className="flex-1 overflow-auto px-2 h-full" style={{ maxHeight: "none" }}>
            <CommandEmpty>No results found.</CommandEmpty>
            {renderSearchContent}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
