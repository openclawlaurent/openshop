# Merchant Filters Implementation Guide

## Overview

This document describes the complete implementation of the database-driven merchant category filters and sort options feature. Non-developers can now manage merchant filters through an admin UI without requiring code deployments.

## What's Been Implemented

### 1. Database Schema

**Location:** `migrations/20251104_create_merchant_filters.sql`

**Tables Created:**

- `merchant_categories` - Category filters for merchant search
- `merchant_sort_options` - Sort options for merchant listings

**Features:**

- Row-Level Security (RLS) policies
- Automatic timestamp updates
- Seasonal category support with date ranges
- Default seed data included

### 2. Admin Interface

**Access:** `/admin/merchant-filters` (requires @fiber.shop email)

**Features:**

- ✅ Create, edit, and delete categories
- ✅ Create, edit, and delete sort options
- ✅ Toggle active/inactive status with switches
- ✅ Seasonal category support
- ✅ Real-time updates
- ✅ Form validation
- ✅ Helpful configuration guide

**Components:**

- `app/admin/merchant-filters/page.tsx` - Page route
- `components/feature/admin/merchant-filter-admin.tsx` - Main admin UI

### 3. API Endpoints

**Admin Endpoints (Auth Required):**

- `GET /api/admin/merchant-categories` - List all categories
- `POST /api/admin/merchant-categories` - Create category
- `PATCH /api/admin/merchant-categories/[id]` - Update category
- `DELETE /api/admin/merchant-categories/[id]` - Delete category
- `GET /api/admin/merchant-sort-options` - List all sort options
- `POST /api/admin/merchant-sort-options` - Create sort option
- `PATCH /api/admin/merchant-sort-options/[id]` - Update sort option
- `DELETE /api/admin/merchant-sort-options/[id]` - Delete sort option

**Public Endpoints:**

- `GET /api/merchant-filters/categories` - Get active categories
- `GET /api/merchant-filters/sort-options` - Get active sort options

### 4. Service Layer

**Location:** `lib/services/merchant-filters.ts`

**Functions:**

- `getMerchantCategories()` - Fetch active categories with seasonal filtering
- `getMerchantSortOptions()` - Fetch active sort options
- `getDefaultSortOption()` - Get the default sort option
- Fallback data for resilience

### 5. UI Components

**New Components:**

- `components/ui/forms/switch.tsx` - Toggle switch component (Radix UI)
- `components/ui/forms/textarea.tsx` - Textarea component

### 6. Admin Navigation

**Updated Files:**

- `app/admin/layout.tsx` - Shared admin layout with auth
- `app/admin/page.tsx` - Simulations page
- `app/admin/cache/page.tsx` - Cache management page
- `app/admin/merchant-filters/page.tsx` - Merchant filters page
- `components/feature/admin/admin-nav.tsx` - Tab navigation

---

## How To Use (For Non-Developers)

### Accessing the Admin Panel

1. Navigate to `/admin/merchant-filters`
2. You must be logged in with a @fiber.shop email address
3. Click the "Merchant Filters" tab

### Managing Categories

#### Adding a New Category

1. Click the "+ Add Category" button
2. Fill in the form:
   - **Slug**: URL-friendly identifier (e.g., `holiday-gifts`)
   - **Label**: Display name shown to users (e.g., `Holiday Gifts`)
   - **Collection IDs**: Comma-separated Algolia collection IDs (e.g., `74, 15`)
   - **Search Keywords**: Keywords to match (e.g., `gifts, presents, holiday`)
   - **Icon Name**: Lucide React icon name (e.g., `Gift`, `ShoppingBag`)
   - **Active**: Toggle to enable/disable
   - **Seasonal**: Toggle for time-limited categories
3. Click "Create Category"

#### Editing a Category

- Use the toggle switch to enable/disable instantly
- Click the trash icon to delete (cannot delete "All" category)

#### Seasonal Categories

For holiday or event-specific categories:

1. Check the "Seasonal" toggle
2. The category will only show during the specified date range
3. Perfect for Black Friday, Christmas, Valentine's Day, etc.

### Managing Sort Options

#### Adding a New Sort Option

1. Click the "+ Add Sort Option" button
2. Fill in the form:
   - **Slug**: URL-friendly identifier (e.g., `highest_cashback`)
   - **Label**: Display name (e.g., `Highest Cashback`)
   - **Algolia Sort By**: Field and direction (e.g., `bestRateAmount:desc`)
   - **Active**: Toggle to enable/disable
   - **Default**: Check if this should be the default sort
3. Click "Create Sort Option"

**Common Sort Patterns:**

- `bestRateAmount:desc` - Highest cashback first
- `bestRateAmount:asc` - Lowest cashback first
- `popularityScore:desc` - Most popular first
- `merchantScore:desc` - Best merchants first
- Leave empty for Algolia's default relevance ranking

---

## Technical Details

### Database Structure

#### merchant_categories

| Column          | Type        | Description                         |
| --------------- | ----------- | ----------------------------------- |
| id              | UUID        | Primary key                         |
| slug            | TEXT        | URL-friendly identifier             |
| label           | TEXT        | Display name                        |
| collection_ids  | INTEGER[]   | Algolia collection IDs to filter by |
| search_keywords | TEXT[]      | Keywords to match against merchants |
| icon_name       | TEXT        | Lucide icon component name          |
| sort_order      | INTEGER     | Display order (lower = first)       |
| is_active       | BOOLEAN     | Whether category is shown to users  |
| is_seasonal     | BOOLEAN     | Whether category is time-limited    |
| start_date      | TIMESTAMPTZ | When seasonal category activates    |
| end_date        | TIMESTAMPTZ | When seasonal category deactivates  |
| created_at      | TIMESTAMPTZ | Creation timestamp                  |
| updated_at      | TIMESTAMPTZ | Last update timestamp               |

#### merchant_sort_options

| Column          | Type        | Description                               |
| --------------- | ----------- | ----------------------------------------- |
| id              | UUID        | Primary key                               |
| slug            | TEXT        | URL-friendly identifier                   |
| label           | TEXT        | Display name                              |
| algolia_sort_by | TEXT        | Algolia sort parameter (NULL for default) |
| is_default      | BOOLEAN     | Whether this is the default sort          |
| sort_order      | INTEGER     | Display order                             |
| is_active       | BOOLEAN     | Whether shown to users                    |
| created_at      | TIMESTAMPTZ | Creation timestamp                        |
| updated_at      | TIMESTAMPTZ | Last update timestamp                     |

### Row Level Security

- **Public read access**: Anyone can read active categories/sort options
- **Admin full access**: Users with @fiber.shop emails can do anything
- Enforced at database level for security

### Caching

- API responses cached for 1 hour using Next.js `unstable_cache`
- Cache automatically cleared when categories/sort options are modified
- Falls back to hardcoded defaults if database unavailable

### Algolia Integration

**Collection IDs:**

- Found in Algolia merchant records under `collectionIds` field
- Examples: 6 (Women), 33 (Fashion), 43 (Men), 20 (Home)

**Search Keywords:**

- Matched against `searchKeywords` field in Algolia
- Merchants with matching keywords will appear in the category

**Sort Parameters:**

- Format: `fieldName:direction`
- Direction: `asc` (ascending) or `desc` (descending)
- Available fields: `bestRateAmount`, `popularityScore`, `merchantScore`, `merchantName`, etc.

---

## Running the Migration

### Option 1: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `migrations/20251104_create_merchant_filters.sql`
4. Paste and run in the SQL editor

### Option 2: Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or run the migration directly
psql $DATABASE_URL < migrations/20251104_create_merchant_filters.sql
```

### Option 3: Manual via psql

```bash
# Connect to your database
psql postgresql://your-connection-string

# Run the migration
\i migrations/20251104_create_merchant_filters.sql
```

---

## Default Data

The migration includes these default categories:

- All
- Womens (collections: 6, 33)
- Mens (collections: 43)
- Home (collections: 20, 28)
- Electronics (collections: 1, 5)
- Beauty (collections: 22, 45)
- Kids (collections: 70)
- Other

And these default sort options:

- Relevant (default, Algolia ranking)
- Max Cashback (bestRateAmount:desc)
- Most Popular (popularityScore:desc)
- Trending (merchantScore:desc)

---

## Troubleshooting

### Categories not showing up

1. Check that the category is set to "Active"
2. If seasonal, verify the date range includes today
3. Check browser console for API errors
4. Verify Algolia collection IDs are correct

### Sort option not working

1. Verify the `algolia_sort_by` syntax (field:direction)
2. Check that the field exists in your Algolia index
3. Test in Algolia dashboard first
4. Check browser console for errors

### Can't access admin page

1. Ensure you're logged in
2. Verify your email ends with @fiber.shop
3. Check browser console for 403 errors
4. Try logging out and back in

### Database migration fails

1. Check that your Supabase connection is working
2. Verify you have admin permissions on the database
3. Look for conflicting table names
4. Check the Supabase logs for detailed error messages

---

## Future Enhancements

Possible improvements for the future:

- Drag-and-drop reordering of categories
- Category analytics (click tracking)
- Bulk import/export of categories
- Preview mode before activating
- A/B testing support
- Custom merchant curated lists
- Category images/banners
- Nested/hierarchical categories

---

## Files Modified/Created

### New Files

**Database:**

- `migrations/20251104_create_merchant_filters.sql`

**API Routes:**

- `app/api/admin/merchant-categories/route.ts`
- `app/api/admin/merchant-categories/[id]/route.ts`
- `app/api/admin/merchant-sort-options/route.ts`
- `app/api/admin/merchant-sort-options/[id]/route.ts`
- `app/api/merchant-filters/categories/route.ts`
- `app/api/merchant-filters/sort-options/route.ts`

**Admin Pages:**

- `app/admin/layout.tsx`
- `app/admin/cache/page.tsx`
- `app/admin/merchant-filters/page.tsx`

**Components:**

- `components/feature/admin/admin-nav.tsx`
- `components/feature/admin/merchant-filter-admin.tsx`
- `components/feature/admin/simulation-actions.tsx`
- `components/feature/admin/cache-actions.tsx`
- `components/ui/forms/switch.tsx`
- `components/ui/forms/textarea.tsx`

**Services:**

- `lib/services/merchant-filters.ts`

### Modified Files

**Admin:**

- `app/admin/page.tsx` - Now just the simulations page

**Dependencies:**

- `package.json` - Added @radix-ui/react-switch

---

## Support

For questions or issues:

1. Check the Configuration Guide in the admin UI
2. Review this document
3. Check browser console for errors
4. Contact the development team

---

## Security Notes

- All admin endpoints require @fiber.shop email authentication
- Row-level security policies enforced at database level
- Public endpoints only expose active categories/sort options
- No sensitive data exposed in public APIs
- SQL injection protected by Supabase client
- XSS protection via React's automatic escaping

---

## Performance

- API responses cached for 1 hour
- Cache persists across Vercel serverless instances
- Fallback data ensures resilience
- Seasonal filtering happens server-side
- Minimal database queries (indexed columns)
- No N+1 query problems

---

Generated: November 4, 2025
Version: 1.0.0
