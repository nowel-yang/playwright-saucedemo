# Debug drills

Six broken tests in [`tests/drills/debug-drills.spec.ts`](../tests/drills/debug-drills.spec.ts),
for practicing Playwright's debugging tools. Each one fails for a different reason.
The goal is to find **why** with the suggested tool, explain it out loud as you would in
an interview, then fix it.

These drills live on the `debug-practice` branch only. Don't merge them into `main`.

Answers: [debug-drills-answers.md](debug-drills-answers.md). Try each drill first.

## Run a drill

```bash
npx playwright test --grep @DRILL-1 --project=chromium            # just run it
npx playwright test --grep @DRILL-1 --project=chromium --debug    # Playwright Inspector
npx playwright test --grep @DRILL --ui                            # all drills in UI mode
```

## The drills

| Drill | Test | Symptom | Practice with |
| --- | --- | --- | --- |
| `@DRILL-1` | log out from the burger menu | Times out after 30s | `--debug` and **Pick locator** in the Inspector |
| `@DRILL-2` | add the backpack to the cart | Fails immediately on a click | Read the error message, then **Pick locator** |
| `@DRILL-3` | cart badge shows items already in the cart | Badge not found | VS Code debugger: breakpoint + **Debug Test**, or `await page.pause()` |
| `@DRILL-4` | cart link is shown after login | Fails *sometimes* | `--repeat-each=20`, then the trace (`--trace on`) |
| `@DRILL-5` | performance glitch user sees the products | Fails with 0 products | Trace Viewer: look at the timeline and the action durations |
| `@DRILL-6` | sort products by name Z to A | Wrong first product | `--headed` or UI mode: watch what the page does |

## For each drill, answer

1. **What failed?** A locator, an assertion, or a timeout? Quote the error.
2. **Why?** Is the problem in the test (locator, timing, data), in the app, or in the environment?
3. **How did you prove it?** Which tool, and what did it show you?
4. **What's the right fix?** Not just one that makes it pass, but one that won't come back.

## Tips

- Run with `--project=chromium` while practicing, so each drill runs once instead of three times.
- In the VS Code Testing sidebar, filter by `@DRILL` to see only these tests.
- `npm run lint` flags one of the drills. In an interview, "the linter would have caught
  this" is a good answer, as long as you can also explain *why* it's a bug.
- The pre-commit hook runs lint and the full test suite, so it will block commits on this
  branch while drills are still broken. Use `git commit --no-verify` here, and only here.
