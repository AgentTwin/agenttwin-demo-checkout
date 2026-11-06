# AgentTwin demo: a PR check that blocks a duplicate charge

A small checkout script charges a customer through Stripe and posts to Slack. When Stripe saves a payment but its reply is lost, the original code retried without an idempotency key and charged the customer twice.

[AgentTwin](https://agenttwin.si) found that bug against twins of Stripe and Slack (synthetic data, no real service is called), the fix was verified, and the passing run was locked as a check in `.agenttwin/regressions/`.

Every pull request runs that locked check from `main` against the PR's code (`.github/workflows/agenttwin.yml`). `main` requires it to pass. A PR that brings the bug back cannot be merged.

Try it locally:

```bash
npx agenttwin@latest run --file agenttwin.world.json
npx agenttwin@latest check --base main --head HEAD
```

`app.fixed.mjs` is the fixed version kept for reference; `app.mjs` is what runs.
