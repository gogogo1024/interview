# Issue 4 - Test Infrastructure & Coverage Audit and Fix Record

Date: 2026-08-04

## Problem summary

The test suite had structural gaps and isolation issues that caused widespread, environment-dependent E2E failures. Running package-local E2E (frontend only) produced many login redirects to `/auth/login` because the API was not started. Tests also relied on fragile selectors and shared browser state which allowed cross-test leakage.

## Key anti-patterns

- Running E2E from a package folder that starts only the frontend server (no API) — tests assume backend is available.
- Fragile DOM selectors (e.g. `textarea[placeholder*="comment"]`) that break during hydration, dev overlay, or slow compilation.
- `loginAs` helper that reused or depended on existing browser storage/cookies across tests, enabling state leakage.
- Temporary debugging by serializing workers without addressing isolation; masks root causes.

## Fix

- Add `waitForCommentForm` helper and replace fragile selectors in E2E specs with a stable locator.
- Harden `loginAs` to clear cookies/localStorage before login, reload after login, and retry up to 3 times on transient failures.
- Make DB seed/reset explicit and required before running full E2E; document canonical entrypoint (`pnpm run db:seed` then `pnpm run test:e2e` from repo root).
- Keep Playwright serial config only as a temporary debugging measure; recommend per-worker DB isolation for parallel runs.

Files touched (representative):

- `apps/client-user/tests/e2e/fixtures/test-helpers.ts` — `waitForCommentForm`, `loginAs` hardening, overlay mitigation
- `apps/client-user/playwright.config.ts` — temporary serial workers for debugging
- `package.json` (repo root) — `test:e2e` ensures build → start API → wait /health → run tests
- multiple E2E specs under `apps/client-user/tests/e2e` — selector replacements

## Verification

Canonical verification steps used during the audit:

```bash
cd interviewQuestions/llm-web-refactoring-test-gogogo1024
pnpm run db:seed
pnpm run test:e2e
```

Result observed in CI-like run: `201 passed` (approx. 14.0 minutes). A single failing regression was reproduced when API was not started; after seeding and running from repo root the full suite passed.

Local single-test reproduction (used to validate `loginAs`):

```bash
pnpm --filter api start & API_PID=$!
until curl -sf http://localhost:3001/health >/dev/null 2>&1; do sleep 0.5; done
pnpm --filter @chirp/client-user exec playwright test tests/e2e/auth.comprehensive.spec.ts --grep "should show error for existing username" --workers=1 --reporter=line
kill $API_PID 2>/dev/null
```

## Suggested commits

- `test(e2e): add waitForCommentForm and replace fragile selectors`
- `test(e2e): harden loginAs (clear storage, reload, retry)`
- `test(e2e): document db:seed pre-step and canonical e2e entrypoint`
- `chore(docs): add ISSUE-4-AUDIT.md and issue-4-submission.md`

## Conclusion

Root causes were primarily test harness and runner invocation mistakes (frontend-only runs and fragile helpers), not core app logic. After hardening helpers and enforcing the correct seed+run flow, the full E2E suite is reproducible and stable. Long-term: implement per-worker DB isolation and upload Playwright artifacts for failed runs.
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
