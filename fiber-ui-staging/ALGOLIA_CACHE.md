# Algolia Cache Documentation

## Overview

Algolia search results are cached using Next.js's `unstable_cache` API to reduce API calls and improve performance. The cache is **persistent across serverless function instances** on Vercel and survives deployments.

## Cache Configuration

- **Duration**: 1 hour (3600 seconds)
- **Storage**: Vercel's edge network (production) / in-memory (development)
- **Scope**: Shared across all serverless function instances

## What's Cached

### 1. Search Results (`algolia-search` tag)

- All search queries from `/search` page
- Cached separately per unique query + options combination
- Location: `lib/services/algolia-cache.ts` → `searchAlgoliaCached()`

### 2. Top Offers (`algolia-top-offers` tag)

- Top merchants sorted by score
- Cached per device ID
- Location: `lib/services/algolia-cache.ts` → `getTopOffersCached()`

## Cache Clearing Options

### Option 1: Tag-based Revalidation (Recommended)

**Clear ALL Algolia cache:**

```bash
curl -X POST "http://localhost:3000/api/cache/revalidate?tag=all"
```

**Clear only search cache:**

```bash
curl -X POST "http://localhost:3000/api/cache/revalidate?tag=search"
```

**Clear only top offers cache:**

```bash
curl -X POST "http://localhost:3000/api/cache/revalidate?tag=top-offers"
```

**With secret (production):**

```bash
curl -X POST "http://localhost:3000/api/cache/revalidate?tag=all&secret=YOUR_SECRET"
```

### Option 2: Path-based Revalidation

**Clear search page cache:**

```bash
curl -X POST "http://localhost:3000/api/cache/clear?path=/search"
```

**Clear home page cache:**

```bash
curl -X POST "http://localhost:3000/api/cache/clear?path=/"
```

**Clear all pages (layout revalidation):**

```bash
curl -X POST "http://localhost:3000/api/cache/clear?path=/&type=layout"
```

**With secret (production):**

```bash
curl -X POST "http://localhost:3000/api/cache/clear?path=/search&secret=YOUR_SECRET"
```

### Option 3: Automatic Cache Clearing

Set up a cron job or webhook to automatically clear cache:

**Vercel Cron (recommended):**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cache/revalidate?tag=all&secret=YOUR_SECRET",
      "schedule": "0 */6 * * *" // Every 6 hours
    }
  ]
}
```

**GitHub Actions:**

```yaml
name: Clear Algolia Cache
on:
  schedule:
    - cron: "0 */6 * * *" # Every 6 hours
  workflow_dispatch: # Manual trigger

jobs:
  clear-cache:
    runs-on: ubuntu-latest
    steps:
      - name: Clear cache
        run: |
          curl -X POST "https://your-domain.com/api/cache/revalidate?tag=all&secret=${{ secrets.CACHE_SECRET }}"
```

### Option 4: On-demand ISR from Algolia Webhook

Set up Algolia to notify your app when data changes:

1. In Algolia dashboard, configure webhook to hit:

   ```
   POST https://your-domain.com/api/cache/revalidate?tag=all&secret=YOUR_SECRET
   ```

2. Set environment variable:
   ```bash
   CACHE_REVALIDATE_SECRET=your-secure-random-string
   ```

## Production Setup

### 1. Set Secret (Recommended)

Add to your Vercel environment variables or Doppler:

```bash
CACHE_REVALIDATE_SECRET=your-secure-random-string-here
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

### 2. Test Cache Clearing

**Check endpoint info:**

```bash
curl http://localhost:3000/api/cache/revalidate
```

**Clear cache:**

```bash
curl -X POST "http://localhost:3000/api/cache/revalidate?tag=all&secret=YOUR_SECRET"
```

### 3. Monitoring

The cache endpoints return detailed responses:

```json
{
  "success": true,
  "message": "Cache revalidated for tag: all",
  "tag": "algolia-all",
  "timestamp": "2025-10-17T12:00:00.000Z"
}
```

## Development

### Disable Caching in Development

To disable search caching during development, the cache still has a 1-hour TTL. To force fresh data:

1. Use the clear cache endpoint after each test
2. Or modify `lib/services/algolia-cache.ts` to use shorter revalidate time in development

### Cache Keys

Cache keys are automatically generated from:

- Query string (normalized: lowercase, trimmed)
- Search options (filters, pagination, etc.)

Example cache key: `"nike":{"hitsPerPage":39,"page":0}`

## Migration Notes

### What Changed

- ✅ Removed in-memory `topOffersCache` (didn't work well on Vercel)
- ✅ All caching now uses `unstable_cache` (Vercel-optimized)
- ✅ Cache persists across serverless instances
- ✅ Cache survives deployments

### Files Changed

- `lib/services/algolia-cache.ts` - New centralized caching
- `components/data-access/offers.ts` - Uses `searchAlgoliaCached()`
- `lib/services/algolia-search-server.ts` - Removed old cache logic
- `app/api/cache/revalidate/route.ts` - Tag-based cache clearing
- `app/api/cache/clear/route.ts` - Path-based cache clearing

## Troubleshooting

### Cache not clearing?

1. Check if secret is required: `GET /api/cache/revalidate`
2. Verify secret matches environment variable
3. Check response for error messages

### Too many Algolia calls?

1. Verify cache is enabled (check logs for "CACHED" messages)
2. Check cache hit rate in Vercel logs
3. Consider increasing `REVALIDATE_TIME` in `algolia-cache.ts`

### Stale data showing?

1. Clear cache using one of the options above
2. Wait up to 1 hour for automatic revalidation
3. Check if Algolia data actually updated

## Performance Impact

**Before (no caching):**

- Every page load = 1 Algolia API call
- High API usage on Vercel (different instances)
- Slower response times

**After (with unstable_cache):**

- First request = 1 Algolia API call (cached for 1 hour)
- Subsequent requests = 0 Algolia API calls (served from cache)
- Cache shared across all serverless instances
- Faster response times

**Estimated savings:**

- 90%+ reduction in Algolia API calls
- Sub-100ms response times for cached queries
- Lower Algolia costs
