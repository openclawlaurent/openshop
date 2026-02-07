"use client";

import { useState, useEffect } from "react";
import { Button } from "@/lib/ui/data-display/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/ui/forms/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/lib/ui/overlay/sheet";
import {
  getMerchantCategories,
  getMerchantSortOptions,
} from "@/lib/services/merchant-filters-client";
import type { MerchantCategory, MerchantSortOption } from "@/lib/services/merchant-filters-client";
import { cn } from "@/lib/utils";
import { ArrowDownWideNarrow, Check } from "lucide-react";

interface OffersFiltersProps {
  selectedCategory?: string;
  selectedSort?: string;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
}

export function OffersFilters({
  selectedCategory = "all",
  selectedSort,
  onCategoryChange,
  onSortChange,
}: OffersFiltersProps) {
  const [categories, setCategories] = useState<MerchantCategory[]>([]);
  const [sortOptions, setSortOptions] = useState<MerchantSortOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);

  useEffect(() => {
    async function loadFilters() {
      try {
        const [cats, sorts] = await Promise.all([
          getMerchantCategories(),
          getMerchantSortOptions(),
        ]);
        setCategories(cats);
        setSortOptions(sorts);
      } catch (error) {
        console.error("Error loading filters:", error);
      } finally {
        setLoading(false);
      }
    }
    loadFilters();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <div className="h-10 w-full max-w-md bg-muted rounded-md animate-pulse" />
        <div className="h-10 w-48 bg-muted rounded-md animate-pulse" />
      </div>
    );
  }

  // Get selected category and sort labels for mobile buttons
  const selectedCategoryLabel = categories.find((c) => c.slug === selectedCategory)?.label || "All";
  const selectedSortLabel =
    sortOptions.find((s) => s.slug === selectedSort)?.label || sortOptions[0]?.label || "Sort";

  return (
    <>
      {/* Mobile: Two separate buttons */}
      <div className="md:hidden flex items-center justify-between gap-2">
        {/* Category Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCategorySheetOpen(true)}
          className="flex-1"
        >
          <span>{selectedCategoryLabel}</span>
        </Button>

        {/* Sort Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortSheetOpen(true)}
          className="gap-2 flex-1"
        >
          <ArrowDownWideNarrow className="h-4 w-4" />
          <span>{selectedSortLabel}</span>
        </Button>
      </div>

      {/* Desktop: Original Layout */}
      <div className="hidden md:flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.slug;

            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category.slug)}
                className={cn(!isSelected && "hover:bg-accent")}
              >
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowDownWideNarrow className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedSort} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.id} value={option.slug}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Category Sheet */}
      <Sheet open={categorySheetOpen} onOpenChange={setCategorySheetOpen}>
        <SheetContent side="bottom" className="h-[80vh] flex flex-col">
          <SheetHeader>
            <SheetTitle>Category</SheetTitle>
          </SheetHeader>

          <div className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.slug;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    onCategoryChange(category.slug);
                    setCategorySheetOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-accent border-border",
                  )}
                >
                  <span className="flex-1 font-medium">{category.label}</span>
                  {isSelected && <Check className="h-5 w-5" />}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Sort Sheet */}
      <Sheet open={sortSheetOpen} onOpenChange={setSortSheetOpen}>
        <SheetContent side="bottom" className="h-[60vh] flex flex-col">
          <SheetHeader>
            <SheetTitle>Sort By</SheetTitle>
          </SheetHeader>

          <div className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
            {sortOptions.map((option) => {
              const isSelected = selectedSort === option.slug;

              return (
                <button
                  key={option.id}
                  onClick={() => {
                    onSortChange(option.slug);
                    setSortSheetOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-accent border-border",
                  )}
                >
                  <span className="flex-1 font-medium">{option.label}</span>
                  {isSelected && <Check className="h-5 w-5" />}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
