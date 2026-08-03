# Platform Refactoring Assessment

> **Time limit:** 90 minutes

> **Rules:** LLM and AI tool usage is permitted. All existing tests (unit and E2E) must pass when you're done.

> **Scope:** You may modify any file in the repository.

---

## General Notes

- **Read the codebase end-to-end before starting.** Understand the architecture, the data flow from client through API to database, the build system, the test infrastructure, and the conventions in use. Your solutions will be evaluated on whether they demonstrate genuine understanding of the system.
- You are not told what technology to use or how to implement your solutions. You must audit, diagnose, and decide. Each task gives a direction and a definition of done.
- Every change requires tests to pass and a brief written justification (inline comments or a separate markdown file).
- Fix as many of the underlying issues as possible, in the process feel free to refactor the system to make it more maintainable while following best practices. As a guideline, prefer minimal, surgical changes over sweeping refactors. Fix the problem, not the neighborhood.
- The order in which you tackle the issues, does not matter.

---

## Issue 1: The Credential Problem

This system stores user credentials and establishes trust between the client and the API. There are critical vulnerabilities in both. With millions of user accounts — credential security is non-negotiable.

**Expectations:**
- Identify and document the credential storage vulnerability: what it is, how it could be exploited, and how severe it is
- Fix it with a backwards-compatible migration strategy. Existing seeded users must still be able to log in after your fix — you don't have their plaintext passwords, so think carefully about how to migrate incrementally.
- Identify and document the trust establishment problem between client and API. Fix it
- Write tests that prove each vulnerability existed and is now resolved

---

## Issue 2: The Query Performance Problem

Multiple services in the API have a systemic query performance issue. At scale, this pattern would bring down the database. This task is about the application layer, not database tuning.

**Expectations:**
- Profile these operations and document the exact number of SQL queries each executes: loading the home feed (10 posts), loading a user profile page, loading the bookmarks page (10 bookmarked posts)
- Identify the anti-pattern causing unnecessary database load. Fix the worst offenders
- Your refactored code must return identical API responses — no regressions
- Document before/after query counts
- Establish a reusable pattern or utility that prevents future developers from reintroducing the problem

---

## Issue 3: Error Handling & Observability

The API has inconsistent error handling and no request tracing. In production, this would make debugging impossible.

**Expectations:**
- Audit every handler and catalogue how each handles errors (the strategies vary — identify them all)
- Design and implement a unified error taxonomy that maps appropriately to gRPC status codes
- Add request-level tracing: each gRPC call gets a unique trace ID that propagates through the service layer, appears in all log output, and is returned to the client
- Add structured logging for every request with enough context to debug production issues
- Your changes must not break existing response contracts that the client and tests depend on

---

## Issue 4: Test Infrastructure & Coverage Gaps

The test suite has structural problems and meaningful coverage gaps.

**Expectations:**
- Audit both the API unit tests and client E2E tests. Identify: untested services, untested error paths, test isolation issues, and patterns in the test helpers that encourage or discourage good testing
- Fix any test isolation problems

---

## Task 5: Build Pipeline & Developer Experience

There is no CI, no pre-commit validation, and the build configuration may have gaps. We need every PR to be validated automatically — set that up here.

**Expectations:**
- A CI pipeline that validates PRs: dependencies, type checking, linting, unit tests, and builds. Steps must fail fast
- The pipeline must leverage the monorepo's build tool correctly — only changed packages and their dependents should rebuild
- A pre-commit hook that validates staged changes quickly enough to be practical
- Audit the monorepo build configuration for correctness: task dependencies, cache configuration, dev task handling. Fix any issues
- A concise developer setup guide (under 50 lines)

---

## Submission

- `pnpm install && pnpm build` must succeed with zero errors
- All pre-existing tests must pass (unit and E2E)
- Your new tests must also pass
- Commit your work with clear, atomic commits — one per task
- Include any audit documents or write-ups as committed files
