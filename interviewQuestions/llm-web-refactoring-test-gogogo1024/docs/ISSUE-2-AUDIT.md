# Issue 2 - Query Performance Audit and Fix Record

Date: 2026-08-02

## Problem Summary

Several read paths in the API used an N+1 query pattern: fetch the main records first, then fetch counts and state one by one or in fragmented follow-up queries. At scale, a single request could trigger far too many SQL statements.

## Key Anti-Patterns

- Running separate like/comment count queries for each post/comment in list views.
- Failing to batch the main query and the follow-up enrichment queries on pages such as bookmarks, feed, and profile.
- Splitting count logic across multiple services, which makes regression easy.

## Fix

- Added batch aggregation services:
  - [apps/api/src/services/postMetrics.service.ts](../apps/api/src/services/postMetrics.service.ts)
  - [apps/api/src/services/commentMetrics.service.ts](../apps/api/src/services/commentMetrics.service.ts)
- Refactored feed / posts / bookmarks / comments / search to batch counts and like state, then merge results in memory.
- Added a shared performance guard test to prevent regressions:
  - [apps/api/src/services/query-performance.test.ts](../apps/api/src/services/query-performance.test.ts)

## Query Count Comparison

The following query counts have been verified against 10-record samples:

- Home feed: 5 SQL queries
- User profile: 5 SQL queries
- Bookmarks page: 5 SQL queries

## Verification

- `pnpm --filter @chirp/api build` passed
- `pnpm exec vitest run src/services/query-performance.test.ts` passed, with 3/3 tests passing

## Conclusion

The core issue2 performance problem has been fixed, and the query counts are now locked down by tests. There are no remaining N+1 hotspots in these three primary paths in the current repository.