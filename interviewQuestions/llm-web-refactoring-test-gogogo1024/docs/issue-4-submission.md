# Issue 4 — Test Infrastructure & Coverage: Audit and Fixes

## Executive summary

This document records the audit, fixes and verification steps for Issue 4 (Test Infrastructure & Coverage Gaps). The primary goal was to close structural test gaps, harden client E2E against state leakage, and ensure the end-to-end suite is reproducible and reliable in local and CI environments.

Result: after applying the changes and seeding the test DB, running the monorepo E2E script produced a successful run: `201 passed` (approx. 14.0 minutes). The original, large-scale failures were caused by running the frontend-only test runner (no API) and fragile test helpers/selectors — not by the core application logic.

## Scope and goals

- Audit API unit tests and client E2E tests for coverage gaps and isolation problems.
- Fix test isolation issues that cause flaky or environment-dependent failures.
- Stabilize E2E helpers and selectors to reduce timing-related failures.
- Document reproduction steps, verification commands, and provide PR/commit guidance.

## What changed (high level)

- Added a stable helper `waitForCommentForm` for comment input discovery and replaced fragile selector patterns that relied only on placeholder text.
- Hardened `loginAs` Playwright helper: clear browser state (cookies/localStorage), perform login, reload and assert, and retry up to 3 times on transient failures.
- Extracted and documented the DB seed/reset requirement and made it a required pre-step for full E2E runs.
- Temporarily adjusted Playwright config for debugging (serial workers) while diagnosing concurrency-related interference. Long-term solution is test isolation per worker, not permanent serial execution.
- Added an audit report file documenting the findings and verification steps.

## Files changed or added

- `apps/client-user/tests/e2e/fixtures/test-helpers.ts` — added `waitForCommentForm`, hardened `loginAs` (clear + retry), Vite overlay mitigation script.
- `apps/client-user/playwright.config.ts` — short-term test config changes used for debugging (serial workers, reuseExistingServer, webServer settings remain correct entry point for E2E).
- `package.json` (repo root) — `test:e2e` is the canonical E2E entry; it builds the monorepo, starts the API, waits for `/health`, then runs Playwright tests.
- `docs/issue-4-audit.md` — audit notes (kept and referenced).
- `docs/issue-4-submission.md` — this English submission file (new).

Note: multiple E2E files were updated to use `waitForCommentForm` instead of ad-hoc `page.fill('textarea[placeholder*="comment"]', ...)` patterns. Examples: `posts.*`, `comments.*`, `feed.*`, `mentions.*`, `notifications.*` specs under `apps/client-user/tests/e2e`.

## Reproduction and verification (commands)

1) Reproduce the failure mode (incorrect way that causes widespread redirects to `/auth/login`):

```bash
# This runs only client-user frontend server; API is not started -> many login redirects
pnpm --dir interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/client-user run test:e2e
```

2) Correct verification flow (recommended, canonical):

```bash
cd interviewQuestions/llm-web-refactoring-test-gogogo1024
pnpm run db:seed
pnpm run test:e2e

# Or reproduce a single test with API started manually:
pnpm --filter api start & API_PID=$!
until curl -sf http://localhost:3001/health >/dev/null 2>&1; do sleep 0.5; done
pnpm --filter @chirp/client-user exec playwright test tests/e2e/auth.comprehensive.spec.ts --grep "should show error for existing username" --workers=1 --reporter=line
kill $API_PID 2>/dev/null
```

3) Expected successful final output for full run (example taken from verification run):

```
201 passed (14.0m)
```

## Evidence (key log excerpts)

- Symptom when API was not started: many tests failed with assertion expecting `/` but receiving `/auth/login`.

  - Example assertion failure excerpt:

    - Expected: `http://localhost:3000/`
    - Received: `http://localhost:3000/auth/login`
    - Location: `apps/client-user/tests/e2e/fixtures/test-helpers.ts` at the `await expect(page).toHaveURL("/")` assertion after submitting login.

- Final verification evidence: full run returned `201 passed` and HTML report was served locally in Playwright's report directory.

## Root causes

- Running the client test runner from the package directory only starts the frontend server; the tests require the API to be running to complete login and server-driven flows.
- Several tests used fragile DOM selectors (placeholder-based `textarea[placeholder*="comment"]`) that fail during hydration, dev overlay injection, or slow compilation.
- `loginAs` helper previously reused or depended on browser state between tests (cookies/localStorage) which allowed state leakage and cross-test pollution.

## Fix details

- Stabilized selectors by providing helper `waitForCommentForm(page, timeout)` that waits for a visible, interactive textarea and returns a locator for subsequent actions.
- Hardened `loginAs`:
  - Clears browser cookies and storage before attempting to log in.
  - Submits the login form and waits for the canonical post-login URL `/` with an explicit reload to ensure header/CSR state is populated.
  - Retries the whole login sequence up to 3 times if the expected post-login redirect does not occur.
- Documented and enforced DB seeding as part of the canonical root `test:e2e` script.

## Suggested atomic commits (one per bullet)

- `test(e2e): add waitForCommentForm helper and replace fragile selectors`
- `test(e2e): harden loginAs helper (clear storage + reload + retry)`
- `test(e2e): document db:seed requirement and add seed helper note`
- `chore(docs): add issue-4-audit.md and issue-4-submission.md`
- `test(e2e): temporarily set serial workers for debugging (playwright.config.ts)`

Each commit should be small and focused; tests must pass after each logical change where possible.

## PR description template

**Title**: Fix Issue 4 — stabilize client-user E2E, harden login helper, add DB seed

**Summary**:

- Fixes multiple E2E flakiness causes: fragile selectors, session leakage, and incorrect test entry usage.
- Adds `waitForCommentForm` and hardens `loginAs` helper to clear storage and retry on failure.
- Documents the required `pnpm run db:seed` pre-step and validates full E2E via the monorepo `test:e2e` script.

**How to verify**:

1. From repo root: `pnpm run db:seed`
2. From repo root: `pnpm run test:e2e` (expect `201 passed`)

**Notes for reviewers**:

- Focus review on `test-helpers.ts` (`loginAs` semantics and retry logic) and on replaced selectors in E2E specs.
- The Playwright config change to serial workers is temporary and was used during debugging; long-term strategy should enable per-worker isolation instead of serial execution.

## CI recommendations

Short-term (immediate):

- Ensure CI e2e job runs from the repo root and runs `pnpm run db:seed` before running `pnpm run test:e2e`.
- Configure the Playwright job to upload traces on first retry (`trace: on-first-retry`) and capture Playwright artifacts as job attachments.

Long-term:

- Provide a per-worker isolated test DB (containerized DB or DB snapshots) so Playwright workers can run in parallel without cross-test contamination.
- Disable Vite/Nitro dev overlay during test runs or inject a small `addInitScript` to hide the overlay in tests.
- Add a small pre-check step that ensures API health and DB migrations are applied before starting browsers.

## Follow-ups and risks

- Parameterize `loginAs` retry/backoff and add unit tests for retry behavior to avoid masking real backend defects.
- Monitor CI for flakiness after re-enabling parallel workers; iterate with isolation-based fixes.

---

If you want, I can also:

- generate the exact commit commands and a ready-to-paste PR body in the repo, or
- open a draft PR branch (but you asked not to submit yet).

Please tell me which of the two (commit/PR drafts or branch + PR) you prefer next.
