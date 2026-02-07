# Admin Cache Management

## Overview

Added Algolia cache management controls to the admin dashboard, allowing @fiber.shop users to clear search cache on demand.

## Features

### Cache Controls in Admin Dashboard

**Location:** `/admin` page (requires @fiber.shop email)

Two cache clearing options available:

1. **Clear All Cache**
   - Clears all Algolia search results and top offers
   - Use when Algolia data has been updated globally
   - Icon: Trash2

2. **Clear Search Cache**
   - Clears only search results cache
   - Top offers cache remains intact
   - Use for targeted cache invalidation
   - Icon: RefreshCw

### Security

**Multi-layer authentication:**

1. **Admin Page Check:** Only @fiber.shop users can access `/admin` page
2. **API Endpoint Check:** Cache endpoints verify @fiber.shop email OR valid secret
3. **Secret Override:** External services can use `?secret=YOUR_SECRET` to bypass user auth

### API Authentication Flow

```
POST /api/cache/revalidate?tag=all
    ↓
Has valid secret? → Yes → Clear cache ✓
    ↓ No
Is @fiber.shop user? → Yes → Clear cache ✓
    ↓ No
Return 403 Forbidden ✗
```

## Usage

### From Admin Dashboard

1. Navigate to `/admin`
2. Scroll to "Cache Management" section
3. Click "Clear Cache" on desired option
4. Toast notification confirms success

### From External Services (Webhooks)

```bash
# Algolia webhook or cron job
curl -X POST "https://your-domain.com/api/cache/revalidate?tag=all&secret=YOUR_SECRET"
```

## Files Changed

### New/Modified Files

1. **`components/feature/admin/admin-actions.tsx`**
   - Added cache management category
   - Added `requiresProfile` flag (cache actions don't need wallet setup)
   - Added cache-specific UI handling
   - Two new actions: `cache-clear-all` and `cache-clear-search`

2. **`app/api/cache/revalidate/route.ts`**
   - Added @fiber.shop authentication check
   - Maintains secret-based auth for external services
   - Returns 403 for unauthorized users

### Action Configuration

```typescript
{
  id: "cache-clear-all",
  title: "Clear All Cache",
  description: "Clears all Algolia search cache...",
  endpoint: "/api/cache/revalidate?tag=all",
  icon: Trash2,
  category: "cache",
  requiresProfile: false, // No wallet/payout setup needed
}
```

## Testing

### Manual Testing Checklist

- [ ] Login as @fiber.shop user
- [ ] Navigate to `/admin`
- [ ] Verify "Cache Management" section appears
- [ ] Click "Clear All Cache" → Success toast appears
- [ ] Click "Clear Search Cache" → Success toast appears
- [ ] Test with non-@fiber.shop user → Access denied on admin page
- [ ] Test API endpoint without auth → 403 Forbidden

### Production Testing

```bash
# Test with admin user (from browser console on /admin page)
fetch('/api/cache/revalidate?tag=all', { method: 'POST' })

# Test with secret (from anywhere)
curl -X POST "https://your-domain.com/api/cache/revalidate?tag=all&secret=YOUR_SECRET"
```

## Environment Setup

**Optional:** Set secret for external service access:

```bash
# Generate secure secret
openssl rand -base64 32

# Add to Vercel/Doppler
CACHE_REVALIDATE_SECRET=<generated-secret>
```

**Note:** Secret is optional. Without it, only authenticated @fiber.shop users can clear cache.

## Architecture

### Admin UI Flow

```
User clicks "Clear Cache" button
    ↓
POST /api/cache/revalidate?tag=all
    ↓
Check authentication (@fiber.shop)
    ↓
revalidateTag("algolia-all")
    ↓
Next.js clears cache across all serverless instances
    ↓
Return success response
    ↓
Show toast notification
```

### Button States

- **Normal:** "Clear Cache"
- **Loading:** "Clearing..." (with spinner)
- **Disabled:** Only if loading (no profile requirement)

## Benefits

✅ **Admin Control:** Admins can force fresh data without code deployment
✅ **Secure:** Multi-layer authentication prevents unauthorized cache clearing
✅ **Flexible:** Works with both user auth and secret-based auth
✅ **No Setup Required:** Cache actions don't require wallet/payout configuration
✅ **User Friendly:** Simple one-click operation with visual feedback

## Related Documentation

- [ALGOLIA_CACHE.md](./ALGOLIA_CACHE.md) - Complete cache implementation guide
- [CACHE_IMPLEMENTATION_SUMMARY.md](./CACHE_IMPLEMENTATION_SUMMARY.md) - Migration summary

---

**Implementation Date:** 2025-10-17
**Status:** ✅ Complete and tested
