import { test, expect, Page, Route, TestInfo } from '@playwright/test';

// API failure drill: a fake checkout page whose Finish button only enables
// after a real API call (httpbin.org) succeeds. Compare the passing test with
// the failing ones in the HTML report. Run with:
//   npx playwright test tests/drills/api-drill.spec.ts --project=chromium

test.use({ trace: 'on', actionTimeout: 5000 });

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

// Round 2: report-reading drills. A fake shop served entirely by page.route(),
// so nothing depends on outside services. One test passes; every other test
// fails on purpose, each for a different reason. Diagnose each failure from the
// HTML report and trace first, then read the setup code to check your answer.

const SHOP_HTML = `
  <h1>Your cart</h1>
  <ul id="items"></ul>
  <p>Total: <span id="total">Loading...</span></p>
  <button id="place" disabled>Place order</button>
  <p id="message" role="status"></p>
  <div id="consent" hidden style="position:fixed;inset:0;background:rgba(0,0,0,.4)">
    <div style="background:#fff;margin:30vh auto;padding:16px;width:280px">
      <p>We use cookies to improve your experience.</p>
      <button id="accept">Accept cookies</button>
    </div>
  </div>
  <script>
    let cart;

    function render() {
      document.getElementById('items').innerHTML = cart.items
        .map(i => '<li>' + i.name + ' x ' + i.qty + ' <button data-id="' + i.id + '">Remove</button></li>')
        .join('');
      const total = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
      document.getElementById('total').textContent = '$' + total.toFixed(2);
    }

    async function load() {
      const res = await fetch('/api/cart');
      if (res.status === 401) {
        location.href = '/login';
        return;
      }
      cart = await res.json();
      render();
      document.getElementById('place').disabled = false;
    }

    document.getElementById('items').addEventListener('click', e => {
      const id = e.target.dataset.id;
      if (!id) return;
      cart.items = cart.items.filter(i => i.id !== id);
      render();
    });

    document.getElementById('place').addEventListener('click', async () => {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.items.map(i => ({ id: i.id, quantity: i.qty })) }),
      });
      const data = await res.json();
      document.getElementById('message').textContent = res.ok
        ? 'Order #' + data.orderId + ' placed'
        : 'Order failed: ' + data.error;
    });

    document.getElementById('accept').addEventListener('click', () => {
      document.getElementById('consent').hidden = true;
    });

    fetch('/api/consent')
      .then(res => res.json())
      .then(c => { document.getElementById('consent').hidden = !c.required; });

    load();
  </script>`;

const LOGIN_HTML = `<h1>Sign in</h1><p>Your session has expired. Please sign in again.</p>`;

// Backpack 29.99 x 1 + Bike Light 9.99 x 3 = 59.96
const CART = {
  items: [
    { id: 'backpack', name: 'Backpack', price: 29.99, qty: 1 },
    { id: 'bike-light', name: 'Bike Light', price: 9.99, qty: 3 },
  ],
};

type Handler = (route: Route) => Promise<void>;

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

// Serves the shop and its API. Each test can swap in its own backend behaviour.
async function openShop(page: Page, backend: { cart?: Handler; order?: Handler; consent?: Handler } = {}) {
  const api: Record<string, Handler> = {
    '/api/cart': backend.cart ?? (route => json(route, CART)),
    '/api/order': backend.order ?? (route => json(route, { orderId: 1042 })),
    '/api/consent': backend.consent ?? (route => json(route, { required: false })),
  };
  await page.route('https://shop.test/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (api[path]) return api[path](route);
    return route.fulfill({ contentType: 'text/html', body: path === '/login' ? LOGIN_HTML : SHOP_HTML });
  });
  await page.goto('https://shop.test/cart');
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

test.describe('Shop report drills', { tag: '@REPORT-DRILL' }, () => {
  test('order can be placed', { tag: '@REPORT-DRILL-001' }, async ({ page }) => {
    await openShop(page);
    await expect(page.locator('#total')).toHaveText('$59.96');
    await page.getByRole('button', { name: 'Place order' }).click();
    await expect(page.getByRole('status')).toHaveText('Order #1042 placed');
  });

  test('cart total is shown', { tag: '@REPORT-DRILL-002' }, async ({ page }) => {
    await openShop(page, {
      cart: async route => {
        await sleep(Math.random() * 9000);
        await json(route, CART).catch(() => {}); // page may already be closed
      },
    });
    await expect(page.locator('#total')).toHaveText('$59.96');
  });

  test('cart total matches item prices', { tag: '@REPORT-DRILL-003' }, async ({ page }) => {
    await openShop(page, {
      cart: route =>
        json(route, { items: CART.items.map(i => ({ ...i, price: Math.round(i.price * 100) })) }),
    });
    await expect(page.locator('#total')).toHaveText('$59.96');
  });

  test('order is confirmed after checkout', { tag: '@REPORT-DRILL-004' }, async ({ page }) => {
    await openShop(page, {
      order: route => {
        const { items } = route.request().postDataJSON();
        const bad = items.findIndex((i: { qty?: number }) => i.qty === undefined);
        return bad === -1
          ? json(route, { orderId: 1043 })
          : json(route, { error: `items[${bad}].qty is required` }, 400);
      },
    });
    await expect(page.locator('#total')).toHaveText('$59.96');
    await page.getByRole('button', { name: 'Place order' }).click();
    await expect(page.getByRole('status')).toHaveText('Order #1043 placed');
  });

  test('first-time visitor can place an order', { tag: '@REPORT-DRILL-005' }, async ({ page }) => {
    await openShop(page, { consent: route => json(route, { required: true }) });
    await expect(page.locator('#total')).toHaveText('$59.96');
    await page.getByRole('button', { name: 'Place order' }).click();
    await expect(page.getByRole('status')).toHaveText('Order #1042 placed');
  });

  test('removing an item updates the total', { tag: '@REPORT-DRILL-006' }, async ({ page }) => {
    await openShop(page);
    await expect(page.locator('#total')).toHaveText('$59.96');
    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(page.locator('#total')).toHaveText('$29.97');
  });

  test('returning customer sees their cart', { tag: '@REPORT-DRILL-007' }, async ({ page }) => {
    await openShop(page, { cart: route => json(route, { error: 'token expired' }, 401) });
    await expect(page.locator('#total')).toHaveText('$59.96');
  });
});
