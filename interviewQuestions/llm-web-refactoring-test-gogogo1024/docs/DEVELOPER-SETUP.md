Developer setup (concise)
-------------------------

1. Clone repository and install deps:

```bash
git clone git@github.com:gogogo1024/interview.git
cd interview/interviewQuestions/llm-web-refactoring-test-gogogo1024
pnpm install -w
```

2. Configure git hooks (one-time):

```bash
pnpm run setup:hooks
```

3. Run quick local CI (affected packages only):

```bash
pnpm run ci:local
```

4. Run full E2E (requires API + DB seed):

```bash
pnpm run db:seed
pnpm run test:e2e
```

That's it — these steps are intentionally short so new contributors can get started fast.
