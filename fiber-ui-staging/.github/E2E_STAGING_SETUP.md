# E2E Testing Against Staging - Setup Guide

This guide explains how to set up and run automated hourly E2E tests against your staging environment.

## Overview

The [e2e-staging-scheduled.yml](workflows/e2e-staging-scheduled.yml) workflow runs Playwright E2E tests against your deployed staging environment every hour. This helps catch issues early before they reach production.

## How It Works

### Test Execution Flow

1. **Scheduled Trigger**: Runs every hour via GitHub Actions cron schedule
2. **Environment**: Tests run against your deployed staging URL (not localhost)
3. **Test Data**: Uses staging database for test user creation via `/api/test-auth` endpoint
4. **Reporting**: Generates and publishes HTML reports to GitHub Pages
5. **Alerting**: Creates GitHub issues automatically when tests fail

### Key Differences from Local/PR Tests

| Aspect         | Local/PR Tests               | Staging Scheduled Tests       |
| -------------- | ---------------------------- | ----------------------------- |
| Environment    | Local dev server             | Deployed staging URL          |
| Database       | Local/dev database           | Staging database              |
| Doppler Config | `local` or `staging_e2e`     | `staging_e2e`                 |
| Server Startup | Playwright starts dev server | Tests against live deployment |
| Frequency      | On-demand                    | Every hour                    |

## Prerequisites

### 1. Staging Environment Requirements

Your staging environment must have:

- ✅ `/api/test-auth` endpoint enabled (requires `NODE_ENV !== 'production'`)
- ✅ `/api/test-user-create` endpoint enabled
- ✅ `/api/test-profile-setup` endpoint enabled
- ✅ Access to Supabase with service role key

**Important**: These test endpoints should only be available in non-production environments. They are automatically blocked when `NODE_ENV=production`.

### 2. Environment Variables

The E2E tests need environment variables in **two places**:

#### A. On Your Staging Deployment (Vercel/hosting)

Your staging environment at `https://app.staging.fiber.shop` needs these (so the test API endpoints work):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
SUPABASE_SECRET_KEY=your-staging-service-role-key
NEXT_PUBLIC_SOLANA_ENVIRONMENT=devnet
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
```

These should already be configured if your staging deployment is working.

#### B. In GitHub Actions Workflow

The E2E test helpers only need `NEXT_PUBLIC_SUPABASE_URL` (to extract project ref for cookies).

This is **not a secret** - it's already visible in your browser when you visit your staging app. Just hardcode it in the [workflow file](workflows/e2e-staging-scheduled.yml#L51):

```yaml
env:
  PLAYWRIGHT_TEST_BASE_URL: https://app.staging.fiber.shop
  NEXT_PUBLIC_SUPABASE_URL: https://your-project.supabase.co
```

**No secrets or Doppler needed!** All the actual Supabase credentials (`ANON_KEY`, `SECRET_KEY`) are on your staging server, not in GitHub Actions.

### 3. GitHub Repository Setup

1. **GitHub Pages** (required for reports)
   - Go to Settings → Pages
   - Source: GitHub Actions
   - Save

## Setup Steps

### Step 1: Update Workflow File

Edit [.github/workflows/e2e-staging-scheduled.yml](workflows/e2e-staging-scheduled.yml#L51) and replace:

```yaml
NEXT_PUBLIC_SUPABASE_URL: https://YOUR_PROJECT_REF.supabase.co
```

With your actual staging Supabase URL (e.g., `https://abc123.supabase.co`).

**Note**: This is not a secret - it's already visible in your browser when you visit `https://app.staging.fiber.shop`.

### Step 2: Enable GitHub Pages

1. Go to Settings → Pages
2. Source: "GitHub Actions"
3. Save

### Step 3: Verify Staging Environment

Ensure your staging deployment at `https://app.staging.fiber.shop` has these env vars configured (should already be there):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key
```

These are needed for the test API endpoints (`/api/test-auth`, etc.) to work.

### Step 4: Verify Test Endpoints

Ensure your staging deployment has the test endpoints enabled:

```typescript
// app/api/test-auth/route.ts
// Should return 403 in production, 200 in staging
export async function POST(request: Request) {
  if (process.env.APP_ENV === "production") {
    return new Response("Forbidden", { status: 403 });
  }
  // ... rest of implementation
}
```

### Step 5: Test the Workflow

1. Manually trigger the workflow:
   - Go to Actions → E2E Tests - Staging (Scheduled)
   - Click "Run workflow"
   - Select branch: `staging` or `main`
   - Click "Run workflow"

2. Monitor the run:
   - Watch for successful test execution
   - Check the Playwright report is published
   - Verify no issues are created (on success)

## Configuration Options

### Change Schedule

Edit [e2e-staging-scheduled.yml](workflows/e2e-staging-scheduled.yml):

```yaml
on:
  schedule:
    # Every hour
    - cron: "0 * * * *"

    # Every 30 minutes
    # - cron: '*/30 * * * *'

    # Every 2 hours
    # - cron: '0 */2 * * *'

    # Business hours only (9 AM - 5 PM UTC, Monday-Friday)
    # - cron: '0 9-17 * * 1-5'
```

### Disable Auto-Issue Creation

Comment out the "Create GitHub issue on test failure" step in the workflow.

### Change Test Database

Update the Doppler `staging_e2e` config with different Supabase credentials.

## Monitoring & Alerts

### GitHub Issues

When tests fail, an issue is automatically created with:

- Link to failed workflow run
- Link to Playwright HTML report
- Timestamp of failure
- Labels: `e2e-test-failure`, `staging`, `automated`

Subsequent failures add comments to the existing issue instead of creating duplicates.

When tests pass again, a success comment is added to help you know when to close the issue.

### Playwright Reports

All test runs publish reports to GitHub Pages:

- URL pattern: `https://{owner}.github.io/{repo}/reports/staging/{run_id}`
- Reports include:
  - Test results (pass/fail)
  - Screenshots on failure
  - Video recordings
  - Detailed logs
  - Traces (on retry)

Reports are retained for 30 days.

## Troubleshooting

### Tests fail with "403 Forbidden" from test-auth endpoint

**Cause**: Test endpoints are blocked in production.

**Solution**: Ensure staging deployment has `NODE_ENV !== 'production'` or explicitly allow test endpoints in staging.

### Tests fail with "PLAYWRIGHT_TEST_BASE_URL not set"

**Cause**: This shouldn't happen - the URL is hardcoded in the workflow.

**Solution**: Check the [workflow file](workflows/e2e-staging-scheduled.yml#L50) has `PLAYWRIGHT_TEST_BASE_URL: https://app.staging.fiber.shop` in the env section.

### Tests time out connecting to baseURL

**Cause**: Staging app is down or URL is incorrect.

**Solution**:

1. Verify staging URL is accessible
2. Check Vercel/hosting dashboard for deployment status
3. Verify DNS and SSL certificate are working

### Database errors during test user creation

**Cause**: Supabase credentials are incorrect or service role key is missing.

**Solution**:

1. Verify `SUPABASE_SECRET_KEY` in Doppler is the **service role key** (not anon key)
2. Check Supabase dashboard: Settings → API → Service Role Key
3. Ensure staging Supabase project is accessible from GitHub Actions IPs

### Workflow doesn't run on schedule

**Cause**: GitHub Actions schedules can be delayed or skipped on free tier.

**Solution**:

1. Use manual workflow dispatch to test
2. Consider upgrading to GitHub Pro for guaranteed scheduled runs
3. Check Actions tab for any workflow errors

### Reports not publishing to GitHub Pages

**Cause**: GitHub Pages not enabled or permissions issue.

**Solution**:

1. Enable GitHub Pages: Settings → Pages → Source: GitHub Actions
2. Verify workflow has `contents: write` permission
3. Check the workflow run logs for deployment errors

## Best Practices

1. **Monitor regularly**: Check the GitHub Issues tab for automated test failure issues
2. **Investigate flaky tests**: If tests fail intermittently, add retries or fix race conditions
3. **Keep staging stable**: Use staging as a pre-production environment, not for active development
4. **Clean test data**: Consider adding a cleanup job to remove old test users
5. **Alert channels**: Set up GitHub notifications or integrate with Slack for test failures

## Related Documentation

- [E2E Testing Guide](../../e2e/README.md) - Local E2E testing
- [Playwright Config](../../playwright.config.ts) - Test configuration
- [CI Workflow](workflows/ci.yml) - PR-based E2E tests
