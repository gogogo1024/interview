# Issue 4 audit

## Summary

Issue 4 focused on closing the structural test gaps in the API and making the client E2E harness more resilient to state leakage.

## API unit test findings

- Search behavior had no dedicated service coverage, so keyword matching and blank-query handling were untested.
- Notification retrieval and authorization error paths were under-covered.
- The shared database reset logic was implicit and easy to duplicate across tests.

## Client E2E findings

- The E2E suite already covered a broad set of user flows, but the auth helper relied on a shared browser state without explicitly clearing prior session data.
- That made cross-test isolation more fragile when the same browser context was reused or when a previous login had left stale cookies/storage behind.

## Changes

- Added service tests for search behavior, including keyword search and blank-query handling.
- Added service tests for notification retrieval and notification error paths.
- Extracted the database reset flow into a reusable helper so each test starts from a clean state.
- Hardened the Playwright auth helper to clear storage and cookies before each login so E2E tests start from a consistent session state.

## Result

The API package now exercises the main search and notification flows directly, and the client E2E auth helper is less prone to session leakage between tests.
