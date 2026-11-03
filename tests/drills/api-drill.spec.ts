import { test, expect, Page, TestInfo } from '@playwright/test';

// API failure drill: a fake checkout page whose Finish button only enables
// after a real API call (httpbin.org) succeeds. Compare the passing test with
// the failing ones in the HTML report. Run with:
//   npx playwright test tests/drills/api-drill.spec.ts --project=chromium

test.use({ trace: 'on' });

const API = {
  ok: 'https://httpbin.org/get',
  slow: 'https://httpbin.org/delay/8', // longer than the 5s expect timeout
  error: 'https://httpbin.org/status/500',
  unreachable: 'https://api.drill.invalid/order', // .invalid never resolves
};

const CHECKOUT_HTML = `
  <h1>Checkout</h1>
  <p id="status">Loading order total...</p>
  <button id="finish" disabled>Finish</button>
  <script>
    const api = new URLSearchParams(location.search).get('api');
    fetch(api)
      .then(res => {
        if (!res.ok) throw new Error('Order API failed with ' + res.status);
        document.getElementById('status').textContent = 'Ready to place order';
        document.getElementById('finish').disabled = false;
      })
      .catch(err => {
        console.error(err.message);
        document.getElementById('status').textContent = 'Something went wrong';
      });
  </script>`;

async function openCheckout(page: Page, api: string) {
  await page.route('https://drill.test/**', route =>
    route.fulfill({ contentType: 'text/html', body: CHECKOUT_HTML }),
  );
  await page.goto(`https://drill.test/checkout?api=${encodeURIComponent(api)}`);
}

// Collect browser console errors and failed API calls, and attach them to the report.
function captureErrors(page: Page, testInfo: TestInfo) {
  const logs: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') logs.push(`[console] ${msg.text()}`);
  });
  page.on('pageerror', err => logs.push(`[uncaught] ${err.message}`));
  page.on('response', res => {
    if (res.status() >= 400) logs.push(`[api] ${res.status()} ${res.url()}`);
  });
  page.on('requestfailed', req => logs.push(`[network] ${req.url()} ${req.failure()?.errorText}`));
  return async () => {
    if (logs.length) {
      console.log(logs.join('\n'));
      await testInfo.attach('browser-errors', { body: logs.join('\n'), contentType: 'text/plain' });
    }
  };
}

test.describe('API failure drill', { tag: '@API-DRILL' }, () => {
  let flushLogs: () => Promise<void>;

  test.beforeEach(async ({ page }, testInfo) => {
    flushLogs = captureErrors(page, testInfo);
  });

  test.afterEach(async () => {
    await flushLogs();
  });

  test('passes: API responds 200, Finish becomes enabled', { tag: '@API-DRILL-001' }, async ({ page }) => {
    await openCheckout(page, API.ok);
    await expect(page.getByRole('button', { name: 'Finish' })).toBeEnabled();
  });

  // Symptom-only assertion: report says "disabled" but not why.
  test('fails: slow API leaves Finish disabled', { tag: '@API-DRILL-002' }, async ({ page }) => {
    await openCheckout(page, API.slow);
    await expect(page.getByRole('button', { name: 'Finish' })).toBeEnabled();
  });

  test('fails: API 500 leaves Finish disabled', { tag: '@API-DRILL-003' }, async ({ page }) => {
    await openCheckout(page, API.error);
    await expect(page.getByRole('button', { name: 'Finish' })).toBeEnabled();
  });

  // No status code at all: the request never reaches a server, so requestfailed fires.
  test('fails: API host unreachable, request never reaches a server', { tag: '@API-DRILL-004' }, async ({ page }) => {
    await openCheckout(page, API.unreachable);
    await expect(page.getByRole('button', { name: 'Finish' })).toBeEnabled();
  });

  // Root-cause assertion: report names the failing endpoint and its status code.
  test('fails: API 500, asserted on the response itself', { tag: '@API-DRILL-005' }, async ({ page }) => {
    const responsePromise = page.waitForResponse(API.error);
    await openCheckout(page, API.error);
    const res = await responsePromise;
    expect(res.status(), `Order API ${res.url()} should return 200`).toBe(200);
    await expect(page.getByRole('button', { name: 'Finish' })).toBeEnabled();
  });
});
