import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const screenshotDir = '../docs/test-reports/f-007-app-foundation';

const cases = [
  ['overview-normal--1440x900.png', '/?screen=overview&state=normal', { width: 1440, height: 900 }],
  ['overview-loading--1440x900.png', '/?screen=overview&state=loading', { width: 1440, height: 900 }],
  ['overview-empty--1440x900.png', '/?screen=overview&state=empty', { width: 1440, height: 900 }],
  ['overview-normal--390x844.png', '/?screen=overview&state=normal', { width: 390, height: 844 }],
  ['calendar-detail-open--1440x900.png', '/?screen=calendar&state=detail-open', { width: 1440, height: 900 }],
  ['calendar-detail-open--390x844.png', '/?screen=calendar&state=detail-open', { width: 390, height: 844 }],
  ['market-comparison-platform-bars--1440x900.png', '/?screen=market&state=normal', { width: 1440, height: 900 }],
  ['market-comparison-platform-bars--390x844.png', '/?screen=market&state=normal', { width: 390, height: 844 }],
  ['alert-review-drawer-open--1440x900.png', '/?screen=alerts&state=drawer-open', { width: 1440, height: 900 }],
  ['alert-review-drawer-open--390x844.png', '/?screen=alerts&state=drawer-open', { width: 390, height: 844 }],
  ['setup-data-scope--1280x800.png', '/?screen=setup&state=normal', { width: 1280, height: 800 }],
  ['setup-data-scope--768x1024.png', '/?screen=setup&state=normal', { width: 768, height: 1024 }],
  ['overview-observatory--2048x1352.png', '/?screen=overview&state=normal', { width: 2048, height: 1352 }],
  ['calendar-observatory--2048x1352.png', '/?screen=calendar&state=detail-open', { width: 2048, height: 1352 }],
  ['market-observatory--2048x1352.png', '/?screen=market&state=normal', { width: 2048, height: 1352 }],
  ['alert-review-observatory--2048x1352.png', '/?screen=alerts&state=drawer-open', { width: 2048, height: 1352 }],
  ['setup-observatory--2048x1352.png', '/?screen=setup&state=normal', { width: 2048, height: 1352 }]
] as const;

const forbiddenVisibleTerms = ['自动调价', '自动改价', '爬虫', '抓取', 'cookie', '验证码', 'token'];

function pngDimensions(path: string): { width: number; height: number } {
  const data = readFileSync(path);
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20)
  };
}

for (const [filename, path, viewport] of cases) {
  test(`captures ${filename} without overflow or forbidden visible copy`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(path);
    await expect(page.locator('.app-shell[data-visual-system="revenue-observatory"]')).toBeVisible();
    await expect(page.locator('.observatory-screen').first()).toBeVisible();
    await expect(page.getByText(/演示数据/).first()).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(8);

    const chartCount = await page.locator('.chart-frame').count();
    const expectsChartFrame = path.includes('screen=calendar') || path.includes('screen=market') || path.includes('screen=overview&state=normal');
    if (expectsChartFrame) {
      expect(chartCount).toBeGreaterThan(0);
    }

    const visibleText = await page.locator('body').innerText();
    for (const term of forbiddenVisibleTerms) {
      expect(visibleText).not.toContain(term);
    }

    const screenshotPath = `${screenshotDir}/${filename}`;
    await page.screenshot({ path: screenshotPath });
    expect(pngDimensions(screenshotPath)).toEqual(viewport);
  });
}

test('analytical screens expose evidence and human review markers', async ({ page }) => {
  await page.goto('/?screen=alerts&state=drawer-open');
  await expect(page.getByText('需人工复核').first()).toBeVisible();
  await expect(page.getByText(/样本/).first()).toBeVisible();
  await expect(page.getByText(/采集时间/).first()).toBeVisible();
});
