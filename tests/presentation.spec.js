import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { routes } from '../.ssr/prerender.js';

const reports = 'docs/verification';
mkdirSync(reports, { recursive: true });

for (const route of routes) {
  test(`route and accessibility: ${route}`, async ({ page, request }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(route);
    expect(response.status()).toBe(200);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page).toHaveTitle(/OCD Brilliance/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${test.info().project.use.baseURL}${route}`);
    expect(await page.locator('main').innerText()).not.toContain('undefined');
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const failures = accessibility.violations.filter(item => ['serious', 'critical'].includes(item.impact));
    writeFileSync(`${reports}/axe-${route.replaceAll('/', '_') || 'home'}.json`, JSON.stringify(accessibility.violations, null, 2));
    expect(failures, JSON.stringify(failures.map(({ id, nodes }) => ({ id, nodes: nodes.map(node => node.target) })))).toEqual([]);
    await page.setViewportSize({ width: 320, height: 800 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    const localLinks = await page.locator('a[href^="/"]').evaluateAll(elements => [...new Set(elements.map(element => new URL(element.href).pathname))]);
    for (const href of localLinks) expect(routes, `Unrecognised local link: ${href}`).toContain(href);
    expect(errors).toEqual([]);
  });
}

test('homepage hierarchy, service finder and key links', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main h1')).toHaveText('Support for a lifethat feels like you.');
  await expect(page.locator('.hero-services-card a')).toHaveCount(6);
  await expect(page.getByRole('group', { name: /Map of OCD Brilliance service areas/ })).toBeVisible();
  const card = page.locator('.hero-card-stage');
  const bounds = await card.boundingBox();
  await page.mouse.move(bounds.x + bounds.width * .8, bounds.y + bounds.height * .3);
  await expect(card).toHaveCSS('--card-y', /deg/);
  expect((await page.locator('.hero-actions .button').boundingBox()).y).toBeLessThan(800);
  await page.getByRole('button', { name: 'Help around my home' }).click();
  await expect(page.locator('.finder-results')).toContainText('Domestic assistance');
  await page.locator('.finder-results').getByRole('link', { name: 'Domestic assistance' }).click();
  await expect(page).toHaveURL('/services/domestic-assistance');
  await expect(page.locator('#main')).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL('/');
  await expect(page.locator('.service-grid .service-card')).toHaveCount(6);
  await expect(page.locator('.faq-list details')).toHaveCount(6);
  await expect(page.locator('.funding-grid')).toContainText('Coming soon');
  await page.getByLabel('Search the listed suburbs').fill('Joondalup');
  await expect(page.locator('.area-map .service-pin.is-selected')).toContainText('Joondalup');
  await page.getByRole('button', { name: 'Clear map search' }).click();
  await expect(page.locator('.area-map .service-pin')).toHaveCount(40);
});

test('brand intro replays on refresh and clears for reduced motion', async ({ page }) => {
  const intro = page.locator('.brand-intro');
  await page.goto('/', { waitUntil: 'commit' });
  await expect(intro).toHaveCSS('visibility', 'visible');
  await expect(intro).toHaveCSS('visibility', 'hidden', { timeout: 4000 });
  await page.reload({ waitUntil: 'commit' });
  await expect(intro).toHaveCSS('visibility', 'visible');
  await expect(intro).toHaveCSS('visibility', 'hidden', { timeout: 4000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'commit' });
  await expect(intro).toHaveCSS('display', 'none');
});

test('mobile menu keyboard, Escape and route selection', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  const trigger = page.getByRole('button', { name: 'Open menu' });
  await trigger.click();
  await expect(page.locator('#mobile-nav a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.locator('#mobile-nav').getByRole('link', { name: 'Services', exact: true }).click();
  await expect(page).toHaveURL('/services');
  await expect(page.locator('#mobile-nav')).toBeHidden();
  await expect(page.locator('#main')).toBeFocused();
});

test('enquiry validation, conditional fields, retry, offline and success without data writes', async ({ page }) => {
  const writes = [];
  page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) writes.push(request.url()); });
  await page.goto('/contact?purpose=referral');
  await expect(page.getByRole('radio', { name: 'Referral / coordination' })).toBeChecked();
  await expect(page.getByLabel('Your organisation')).toBeVisible();
  await page.getByRole('button', { name: 'Preview enquiry' }).click();
  await expect(page.locator('.error-summary')).toBeFocused();
  await expect(page.locator('.error-summary li')).toHaveCount(4);
  await page.getByLabel('Your name').fill('Presentation Visitor');
  await page.getByLabel('Email address').fill('visitor@example.com');
  await page.getByLabel('What would you like to share?').fill('I would like to discuss domestic support. This is sample data.');
  await page.getByLabel('I understand this is a presentation').check();
  await page.getByText('Presentation controls', { exact: true }).click();
  await page.getByLabel('Preview submission state').selectOption('error');
  await page.getByRole('button', { name: 'Preview enquiry' }).click();
  await expect(page.getByRole('button', { name: 'Previewing enquiry…' })).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'This demo enquiry could not be completed.' })).toBeVisible();
  await expect(page.getByLabel('Your name')).toHaveValue('Presentation Visitor');
  await page.getByLabel('Preview submission state').selectOption('offline');
  await page.getByRole('button', { name: 'Preview enquiry' }).click();
  await expect(page.getByRole('heading', { name: 'You’re offline in this demonstration.' })).toBeVisible();
  await page.getByLabel('Preview submission state').selectOption('success');
  await page.getByRole('button', { name: 'Preview enquiry' }).click();
  await expect(page.getByRole('heading', { name: 'Your demo enquiry is complete.' })).toBeVisible();
  await expect(page.locator('.success-panel')).toContainText('Nothing was sent or saved');
  await expect(page.locator('.success-panel')).toBeFocused();
  expect(writes).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});

test('all six contact journeys and phone-only reply', async ({ page }) => {
  await page.goto('/contact');
  for (const purpose of ['New support enquiry', 'Referral / coordination', 'Existing participant', 'Careers', 'Feedback or complaint', 'General enquiry']) {
    await page.getByRole('radio', { name: purpose, exact: true }).check();
    await expect(page.getByRole('radio', { name: purpose, exact: true })).toBeChecked();
  }
  await page.getByLabel('How would you prefer to hear from us?').selectOption('phone');
  await expect(page.getByLabel('Email address')).toHaveCount(0);
  await page.getByLabel('Your name').fill('Demo');
  await page.getByLabel('Phone number').fill('0400000000');
  await page.getByLabel('What would you like to share?').fill('Presentation enquiry');
  await page.getByLabel('I understand this is a presentation').check();
  await page.getByRole('button', { name: 'Preview enquiry' }).click();
  await expect(page.locator('.success-panel')).toBeVisible();
});

test('empty searches, result recovery and resource URL state', async ({ page }) => {
  await page.goto('/areas-we-serve');
  await expect(page.locator('.area-map .service-pin')).toHaveCount(40);
  await page.getByLabel('Search the listed suburbs').fill('Yanchep');
  await expect(page.locator('.area-map .service-pin')).toHaveCount(1);
  await expect(page.locator('.area-map .service-pin.is-selected')).toContainText('Yanchep');
  await page.getByLabel('Search the listed suburbs').fill('unlisted');
  await expect(page.getByRole('heading', { name: 'Let’s check with the team.' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.locator('.area-list li')).toHaveCount(40);
  await page.goto('/resources');
  await page.getByLabel('Find an article').fill('unmatchedtext');
  await expect(page.getByRole('heading', { name: 'No matching reads, yet.' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.resource-card')).toHaveCount(12);
  await page.getByLabel('Find an article').fill('cleaning');
  await page.reload();
  await expect(page.getByLabel('Find an article')).toHaveValue('cleaning');
  expect(await page.locator('.resource-card').count()).toBeGreaterThan(0);
});

test('reduced motion, services card and 404 recovery', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.hero-services-card')).toBeVisible();
  expect(await page.locator('.hero-services-card').evaluate(element => getComputedStyle(element).transform)).toBe('none');
  await expect(page.locator('.hero-actions .button')).toBeVisible();
  expect(await page.locator('.button').first().evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
  await page.goto('/missing-page');
  await expect(page.locator('h1')).toContainText('A little off track?');
  await page.getByRole('link', { name: 'Back to home' }).click();
  await expect(page).toHaveURL('/');
});

test('200 percent text scaling and responsive screenshots', async ({ page }) => {
  for (const path of ['/', '/contact', '/services/nursing', '/resources']) {
    await page.goto(path);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.evaluate(() => document.documentElement.style.fontSize = '200%');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${path} 200% overflow`).toBe(true);
    await page.evaluate(() => document.documentElement.style.fontSize = '');
  }
  await page.goto('/');
  for (const [name, width, height] of [['desktop', 1440, 1000], ['tablet', 768, 1024], ['mobile', 390, 844], ['small', 320, 800]]) {
    await page.setViewportSize({ width, height });
    await page.screenshot({ path: `${reports}/home-${name}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const path of ['/contact', '/services/nursing', '/about', '/resources']) {
    await page.goto(path);
    await page.screenshot({ path: `${reports}/${path.replaceAll('/', '_')}.png`, fullPage: true });
  }
});

test('static HTML, source assets, legal links and legacy paths', async ({ page, browser, request }) => {
  const response = await request.get('/services/nursing');
  expect(await response.text()).toContain('Qualified care.');
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto(`${test.info().project.use.baseURL}/services/nursing`);
  await expect(staticPage.locator('h1')).toBeVisible();
  await staticPage.getByRole('link', { name: 'Explore funding options' }).click();
  await expect(staticPage.locator('h1')).toContainText('A little clarity.');
  await context.close();
  await page.goto('/#pg-services');
  await expect(page).toHaveURL('/services');
  for (const path of ['/privacy', '/terms', '/complaints', '/participant-rights']) await expect(page.locator(`footer a[href="${path}"]`)).toHaveCount(1);
  const assets = await page.locator('img').evaluateAll(elements => elements.map(element => ({ src: element.currentSrc, good: element.complete && element.naturalWidth > 0 })));
  expect(assets.every(asset => asset.good)).toBe(true);
  expect((await request.get('/sitemap.xml')).status()).toBe(200);
  expect(readFileSync('public/assets/logo.png').length).toBeGreaterThan(1000);
});
