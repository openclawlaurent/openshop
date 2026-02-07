# Frontend Filters Integration

## Overview

This document describes the frontend integration of the database-driven merchant filters system. Users can now filter and sort merchants using dynamic category pills and sort dropdowns.

---

## What's Been Added

### 1. **Filter UI Component**

**Location:** `components/feature/offers/offers-filters.tsx`

**Features:**

- Category filter pills with icons
- Sort dropdown with label
- Loading states while fetching from database
- Responsive layout (stacks on mobile)
- Smooth active state transitions

**Usage:**

```tsx
<OffersFilters
  selectedCategory={selectedCategory}
  selectedSort={selectedSort}
  onCategoryChange={handleCategoryChange}
  onSortChange={handleSortChange}
/>
```

### 2. **Updated Offers List**

**Location:** `components/feature/offers/offers-list.tsx`

**Changes:**

- Added `showFilters` prop (default: true)
- Integrated `OffersFilters` component
- URL param syncing for category and sort
- State management for selected filters
- Router integration for filter changes

**New Props:**

- `showFilters?: boolean` - Whether to show filter UI

### 3. **Dynamic Merchant Suggestions**

**Location:** `lib/data/dynamic-merchant-suggestions.ts`

**Purpose:** Provides database-driven alternatives to the hardcoded suggestions

**Functions:**

- `getDynamicMerchantSuggestions()` - Fetch categories from database
- `getCategoryIcons()` - Get category icons for display
- `FALLBACK_MERCHANT_SUGGESTIONS` - Fallback data

### 4. **Deprecated Old File**

**Location:** `lib/data/merchant-suggestions.ts`

- Added deprecation notice at the top
- Explains new system location
- Kept for backward compatibility with search dialog
- Will be fully replaced in future update

---

## How It Works

### Filter Flow

1. **User clicks category pill** (e.g., "Womens")
   - `onCategoryChange("womens")` is called
   - URL updated to `/search?category=womens`
   - Page refreshes with filtered results
   - Category pill shows active state

2. **User changes sort** (e.g., "Max Cashback")
   - `onSortChange("max_cashback")` is called
   - URL updated to `/search?sort=max_cashback`
   - Page refreshes with sorted results
   - Sort dropdown shows selected value

3. **URL Params**
   - `?q=query` - Search query
   - `?category=slug` - Selected category slug
   - `?sort=slug` - Selected sort option slug
   - All params are optional
   - Params persist across navigation

### State Management

```tsx
// URL params are synced with local state
const [selectedCategory, setSelectedCategory] = useState<string>("all");
const [selectedSort, setSelectedSort] = useState<string>("relevant");

// On mount, read from URL
useEffect(() => {
  const categoryParam = searchParams.get("category");
  const sortParam = searchParams.get("sort");

  if (categoryParam) setSelectedCategory(categoryParam);
  if (sortParam) setSelectedSort(sortParam);
}, [searchParams]);

// On change, update URL
const handleCategoryChange = (category: string) => {
  setSelectedCategory(category);
  const params = new URLSearchParams(searchParams.toString());

  if (category === "all") {
    params.delete("category");
  } else {
    params.set("category", category);
  }

  router.push(`/search?${params.toString()}`);
  router.refresh();
};
```

---

## UI/UX Details

### Category Pills

**Desktop:**

```
[🏪 All] [👕 Womens] [👕 Mens] [🏠 Home] [💻 Electronics] [💄 Beauty]
```

**Mobile:**

- Pills wrap to multiple rows
- Same size and spacing
- Touch-friendly tap targets

**Active State:**

- Primary button style (filled background)
- Other pills use outline style
- Smooth transition animations

### Sort Dropdown

**Position:** Right side of filter bar

**Label:** "Sort by: [dropdown]"

**Options:**

- Relevant (default)
- Max Cashback
- Most Popular
- Trending
- (Any custom options from database)

**Icon:** Small arrow-up-down icon to left of dropdown

---

## Integration with Algolia

### Category Filtering

When a category is selected, the offers API should filter by:

- **Collection IDs**: Match against Algolia's `collectionIds` field
- **Keywords**: Match against Algolia's `searchKeywords` field

Example Algolia query:

```typescript
const filters = [];

// If category selected (not "all")
if (category !== "all") {
  const categoryData = categories.find((c) => c.slug === category);

  // Filter by collection IDs
  if (categoryData.collection_ids.length > 0) {
    const collectionFilter = categoryData.collection_ids
      .map((id) => `collectionIds:${id}`)
      .join(" OR ");
    filters.push(`(${collectionFilter})`);
  }

  // OR filter by keywords
  if (categoryData.search_keywords.length > 0) {
    const keywordFilter = categoryData.search_keywords
      .map((kw) => `searchKeywords:"${kw}"`)
      .join(" OR ");
    filters.push(`(${keywordFilter})`);
  }
}

// Apply filters to Algolia search
const results = await index.search(query, {
  filters: filters.join(" AND "),
});
```

### Sort Options

When a sort is selected, apply to Algolia:

```typescript
const sortBy = sortOptions.find((opt) => opt.slug === selectedSort)?.algolia_sort_by;

const results = await index.search(query, {
  // If sortBy is null, use default Algolia ranking
  ...(sortBy && {
    // Option 1: Use replica index
    indexName: `merchants_${sortBy.replace(":", "_")}`,

    // Option 2: Use sortBy parameter (if supported)
    sortBy: sortBy,
  }),
});
```

**Note:** Algolia sorting typically requires replica indices. You may need to create replicas like:

- `merchants_bestRateAmount_desc`
- `merchants_popularityScore_desc`
- `merchants_merchantScore_desc`

---

## Testing Checklist

### Manual Testing

- [ ] Filters load from database on page load
- [ ] Category pills render with correct icons
- [ ] Clicking category updates URL and filters results
- [ ] Sort dropdown shows all options from database
- [ ] Changing sort updates URL and reorders results
- [ ] URL params persist on refresh
- [ ] "All" category shows all merchants
- [ ] Active category pill has correct styling
- [ ] Mobile layout stacks filters properly
- [ ] Loading states show during filter fetch
- [ ] Filters work with search queries
- [ ] Seasonal categories appear/disappear based on dates

### Edge Cases

- [ ] Database unavailable → Uses fallback categories
- [ ] No categories in database → Shows loading/empty state
- [ ] Invalid category slug in URL → Falls back to "all"
- [ ] Invalid sort slug in URL → Falls back to "relevant"
- [ ] Multiple filters combined with search query

---

## Future Enhancements

### Short Term

1. **Server-side filtering** - Apply filters in SSR for faster initial load
2. **Filter counts** - Show merchant count per category (e.g., "Womens (142)")
3. **Active filter badges** - Show currently active filters above results
4. **Clear filters button** - Quick reset to default state

### Medium Term

1. **Multi-select categories** - Allow filtering by multiple categories at once
2. **Price range filter** - Filter by cashback percentage range
3. **Merchant ratings filter** - Filter by minimum rating
4. **Availability filter** - Show only merchants with active offers

### Long Term

1. **Saved filter sets** - Let users save their favorite filter combinations
2. **Smart filters** - AI-suggested categories based on user behavior
3. **Filter analytics** - Track which filters are most popular
4. **Personalized defaults** - Remember user's last used filters

---

## Files Modified/Created

### Created (3 files)

- `components/feature/offers/offers-filters.tsx` - Filter UI component
- `lib/data/dynamic-merchant-suggestions.ts` - Dynamic alternatives
- `FRONTEND_FILTERS_INTEGRATION.md` - This documentation

### Modified (2 files)

- `components/feature/offers/offers-list.tsx` - Added filter integration
- `lib/data/merchant-suggestions.ts` - Added deprecation notice

---

## Performance Considerations

- **Filter data caching**: Category and sort options cached for 1 hour
- **URL-based state**: No prop drilling, filters read from URL
- **Optimistic UI updates**: Immediate visual feedback on filter change
- **Lazy loading**: Filter component loads on mount, not blocking initial render

---

## Accessibility

- **Keyboard navigation**: All filters accessible via Tab key
- **Screen readers**: Proper ARIA labels on all interactive elements
- **Focus management**: Clear focus indicators on pills and dropdown
- **Color contrast**: Meets WCAG AA standards for text and backgrounds

---

## Browser Support

- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android 10+)

---

Generated: November 4, 2025
Version: 1.0.0
