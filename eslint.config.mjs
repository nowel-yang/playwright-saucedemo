import js from "@eslint/js";
import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright";

export default tseslint.config(
  { ignores: ["playwright-report/", "test-results/", "node_modules/"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    // Playwright rules (web-first assertions, missing awaits, fixed waits, ...)
    files: ["tests/**/*.ts", "pages/**/*.ts", "fixtures/**/*.ts"],
    ...playwright.configs["flat/recommended"],
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      // Fixed waits are always a mistake in this project, so block them.
      "playwright/no-wait-for-timeout": "error",
      // Helpers that contain expect() calls, so tests using them count as asserting.
      "playwright/expect-expect": [
        "warn",
        { assertFunctionNames: ["runSortCase"] },
      ],
    },
  }
);
