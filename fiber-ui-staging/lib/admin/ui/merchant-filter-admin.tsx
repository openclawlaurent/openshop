"use client";

import { useState, useEffect } from "react";
import { Button } from "@/lib/ui/data-display/button";
import { Card, CardContent } from "@/lib/ui/layout/card";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, Calendar, Loader2, Save, X } from "lucide-react";
import { Input } from "@/lib/ui/forms/input";
import { Label } from "@/lib/ui/forms/label";
import { Switch } from "@/lib/ui/forms/switch";
import { Textarea } from "@/lib/ui/forms/textarea";

interface MerchantCategory {
  id: string;
  slug: string;
  label: string;
  collection_ids: number[];
  search_keywords: string[];
  icon_name: string | null;
  sort_order: number;
  is_active: boolean;
  is_seasonal: boolean;
  start_date: string | null;
  end_date: string | null;
}

interface SortOption {
  id: string;
  slug: string;
  label: string;
  algolia_sort_by: string | null;
  is_default: boolean;
  sort_order: number;
  is_active: boolean;
}

export function MerchantFilterAdmin() {
  const [categories, setCategories] = useState<MerchantCategory[]>([]);
  const [sortOptions, setSortOptions] = useState<SortOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingSortOption, setAddingSortOption] = useState(false);

  // New category form state
  const [newCategory, setNewCategory] = useState({
    slug: "",
    label: "",
    collection_ids: "",
    search_keywords: "",
    icon_name: "",
    is_active: true,
    is_seasonal: false,
    start_date: "",
    end_date: "",
  });

  // New sort option form state
  const [newSortOption, setNewSortOption] = useState({
    slug: "",
    label: "",
    algolia_sort_by: "",
    is_default: false,
    is_active: true,
  });

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, sortRes] = await Promise.all([
        fetch("/api/admin/merchant-categories"),
        fetch("/api/admin/merchant-sort-options"),
      ]);

      if (!categoriesRes.ok || !sortRes.ok) {
        throw new Error("Failed to load filter data");
      }

      const categoriesData = await categoriesRes.json();
      const sortData = await sortRes.json();

      setCategories(categoriesData);
      setSortOptions(sortData);
    } catch (error) {
      toast.error("Failed to load filter data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/merchant-categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setCategories(
        categories.map((cat) => (cat.id === id ? { ...cat, is_active: !isActive } : cat)),
      );

      toast.success(`Category ${!isActive ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Failed to update category");
    }
  };

  const toggleSortOptionActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/merchant-sort-options/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setSortOptions(
        sortOptions.map((opt) => (opt.id === id ? { ...opt, is_active: !isActive } : opt)),
      );

      toast.success(`Sort option ${!isActive ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Failed to update sort option");
    }
  };

  const deleteCategory = async (id: string, slug: string) => {
    if (slug === "all") {
      toast.error("Cannot delete the 'all' category");
      return;
    }

    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/merchant-categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setCategories(categories.filter((cat) => cat.id !== id));
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const deleteSortOption = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sort option?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/merchant-sort-options/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setSortOptions(sortOptions.filter((opt) => opt.id !== id));
      toast.success("Sort option deleted");
    } catch {
      toast.error("Failed to delete sort option");
    }
  };

  const handleAddCategory = async () => {
    try {
      const collectionIds = newCategory.collection_ids
        ? newCategory.collection_ids.split(",").map((id) => parseInt(id.trim()))
        : [];
      const keywords = newCategory.search_keywords
        ? newCategory.search_keywords.split(",").map((kw) => kw.trim())
        : [];

      const nextSortOrder = Math.max(...categories.map((c) => c.sort_order), 0) + 1;

      const res = await fetch("/api/admin/merchant-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: newCategory.slug,
          label: newCategory.label,
          collection_ids: collectionIds,
          search_keywords: keywords,
          icon_name: newCategory.icon_name || null,
          is_active: newCategory.is_active,
          is_seasonal: newCategory.is_seasonal,
          start_date: newCategory.start_date || null,
          end_date: newCategory.end_date || null,
          sort_order: nextSortOrder,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create category");
      }

      const created = await res.json();
      setCategories([...categories, created]);
      setAddingCategory(false);
      setNewCategory({
        slug: "",
        label: "",
        collection_ids: "",
        search_keywords: "",
        icon_name: "",
        is_active: true,
        is_seasonal: false,
        start_date: "",
        end_date: "",
      });
      toast.success("Category created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create category");
    }
  };

  const handleAddSortOption = async () => {
    try {
      const nextSortOrder = Math.max(...sortOptions.map((s) => s.sort_order), 0) + 1;

      const res = await fetch("/api/admin/merchant-sort-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: newSortOption.slug,
          label: newSortOption.label,
          algolia_sort_by: newSortOption.algolia_sort_by || null,
          is_default: newSortOption.is_default,
          is_active: newSortOption.is_active,
          sort_order: nextSortOrder,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create sort option");
      }

      const created = await res.json();
      setSortOptions([...sortOptions, created]);
      setAddingSortOption(false);
      setNewSortOption({
        slug: "",
        label: "",
        algolia_sort_by: "",
        is_default: false,
        is_active: true,
      });
      toast.success("Sort option created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create sort option");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Categories Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Category Filters</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage which categories appear in the merchant filter dropdown
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchData} variant="outline" size="sm">
              <Loader2 className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setAddingCategory(true)} size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Add Category Form */}
        {addingCategory && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">New Category</h3>
                <Button variant="ghost" size="sm" onClick={() => setAddingCategory(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-slug">Slug *</Label>
                  <Input
                    id="new-slug"
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    placeholder="womens"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-label">Label *</Label>
                  <Input
                    id="new-label"
                    value={newCategory.label}
                    onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                    placeholder="Womens"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-collection-ids">Collection IDs (comma-separated)</Label>
                  <Input
                    id="new-collection-ids"
                    value={newCategory.collection_ids}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, collection_ids: e.target.value })
                    }
                    placeholder="21, 49"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-icon">Icon Name (Lucide)</Label>
                  <Input
                    id="new-icon"
                    value={newCategory.icon_name}
                    onChange={(e) => setNewCategory({ ...newCategory, icon_name: e.target.value })}
                    placeholder="ShoppingBag"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="new-keywords">Search Keywords (comma-separated)</Label>
                  <Textarea
                    id="new-keywords"
                    value={newCategory.search_keywords}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, search_keywords: e.target.value })
                    }
                    placeholder="women, fashion, clothing, apparel"
                    rows={2}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="new-active"
                    checked={newCategory.is_active}
                    onCheckedChange={(checked: boolean) =>
                      setNewCategory({ ...newCategory, is_active: checked })
                    }
                  />
                  <Label htmlFor="new-active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="new-seasonal"
                    checked={newCategory.is_seasonal}
                    onCheckedChange={(checked: boolean) =>
                      setNewCategory({ ...newCategory, is_seasonal: checked })
                    }
                  />
                  <Label htmlFor="new-seasonal">Seasonal</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddingCategory(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCategory}>
                  <Save className="mr-2 h-4 w-4" />
                  Create Category
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <div className="grid gap-4">
          {categories
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((category) => (
              <Card key={category.id} className={!category.is_active ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{category.label}</h4>
                        {category.is_seasonal && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
                            <Calendar className="h-3 w-3" />
                            Seasonal
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Slug:{" "}
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {category.slug}
                        </code>
                        {category.collection_ids.length > 0 && (
                          <span className="ml-3">
                            Collections: {category.collection_ids.join(", ")}
                          </span>
                        )}
                        {category.icon_name && (
                          <span className="ml-3">Icon: {category.icon_name}</span>
                        )}
                      </p>
                      {category.search_keywords.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Keywords: {category.search_keywords.join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={category.is_active}
                        onCheckedChange={() =>
                          toggleCategoryActive(category.id, category.is_active)
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategory(category.id, category.slug)}
                        disabled={category.slug === "all"}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Sort Options Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Sort Options</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure available sorting options for merchant listings
            </p>
          </div>
          <Button onClick={() => setAddingSortOption(true)} size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Sort Option
          </Button>
        </div>

        {/* Add Sort Option Form */}
        {addingSortOption && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">New Sort Option</h3>
                <Button variant="ghost" size="sm" onClick={() => setAddingSortOption(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sort-slug">Slug *</Label>
                  <Input
                    id="sort-slug"
                    value={newSortOption.slug}
                    onChange={(e) => setNewSortOption({ ...newSortOption, slug: e.target.value })}
                    placeholder="max_cashback"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort-label">Label *</Label>
                  <Input
                    id="sort-label"
                    value={newSortOption.label}
                    onChange={(e) => setNewSortOption({ ...newSortOption, label: e.target.value })}
                    placeholder="Max Cashback"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="sort-algolia">Algolia Sort By</Label>
                  <Input
                    id="sort-algolia"
                    value={newSortOption.algolia_sort_by}
                    onChange={(e) =>
                      setNewSortOption({ ...newSortOption, algolia_sort_by: e.target.value })
                    }
                    placeholder="maxRateAmount:desc"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for default Algolia ranking. Examples: maxRateAmount:desc,
                    popularityScore:desc
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sort-active"
                    checked={newSortOption.is_active}
                    onCheckedChange={(checked: boolean) =>
                      setNewSortOption({ ...newSortOption, is_active: checked })
                    }
                  />
                  <Label htmlFor="sort-active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sort-default"
                    checked={newSortOption.is_default}
                    onCheckedChange={(checked: boolean) =>
                      setNewSortOption({ ...newSortOption, is_default: checked })
                    }
                  />
                  <Label htmlFor="sort-default">Default</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddingSortOption(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSortOption}>
                  <Save className="mr-2 h-4 w-4" />
                  Create Sort Option
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sort Options List */}
        <div className="grid gap-4 md:grid-cols-2">
          {sortOptions
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((option) => (
              <Card key={option.id} className={!option.is_active ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{option.label}</h4>
                        {option.is_default && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.algolia_sort_by || "Algolia default ranking"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={option.is_active}
                        onCheckedChange={() => toggleSortOptionActive(option.id, option.is_active)}
                      />
                      <Button variant="ghost" size="sm" onClick={() => deleteSortOption(option.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Info Panel */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold mb-3">Configuration Guide</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">Collection IDs:</strong> Comma-separated list of
              Algolia collection IDs. Find these in your Algolia merchant records (e.g., 6, 33 for
              Womens).
            </div>
            <div>
              <strong className="text-foreground">Search Keywords:</strong> Keywords to match
              against the searchKeywords field in Algolia. Merchants with these keywords will show
              in this category.
            </div>
            <div>
              <strong className="text-foreground">Icon Names:</strong> Use Lucide React icon names
              (e.g., ShoppingBag, Home, Heart). See https://lucide.dev for full list.
            </div>
            <div>
              <strong className="text-foreground">Seasonal Categories:</strong> Enable for
              holiday/event-specific categories. They&apos;ll only show during the specified date
              range.
            </div>
            <div>
              <strong className="text-foreground">Sort Options:</strong> Algolia sort syntax is
              field:direction (e.g., bestRateAmount:desc, popularityScore:asc).
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
