const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const demoDir = path.join(root, "prototypes", "client-demo");
const appPath = path.join(demoDir, "app.js");
const htmlPath = path.join(demoDir, "index.html");
const cssPath = path.join(demoDir, "styles.css");
const readmePath = path.join(demoDir, "README.md");

const app = require(appPath);

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function test(name, fn) {
  try {
    fn();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("demo data exposes one hotel, ten competitors, thirty dates, and local sample source", () => {
  assert.equal(app.demoData.ownerHotel.name, "云栖城市酒店");
  assert.equal(app.demoData.competitors.length, 10);
  assert.equal(app.demoData.competitors.filter((item) => item.level === "core").length, 6);
  assert.equal(app.demoData.competitors.filter((item) => item.level === "reference").length, 4);
  assert.equal(app.demoData.rateDays.length, 30);
  assert.match(app.demoData.source.name, /演示/);
  assert.match(app.demoData.source.captureTime, /2026-05-18/);
});

test("overview metrics and recommendation copy are derived from local demo data", () => {
  const metrics = app.deriveOverviewMetrics(app.demoData);

  assert.equal(metrics.alertCount, app.demoData.alerts.length);
  assert.equal(metrics.marketMovement, "+16%");
  assert.match(metrics.weekendOpportunity, /周末/);
  assert.match(metrics.ownerRisk, /低于核心竞品/);
  assert.ok(metrics.recommendation.includes("建议关注"));
});

test("calendar selection returns detail rows and alert rationale for the chosen date", () => {
  const detail = app.getDateDetail("2026-05-30", app.demoData);

  assert.equal(detail.date, "2026-05-30");
  assert.equal(detail.isWeekend, true);
  assert.equal(detail.competitorRows.length, 10);
  assert.ok(detail.averageRate > 0);
  assert.ok(detail.minRate < detail.maxRate);
  assert.match(detail.alertReason, /建议关注|样本不足|市场/);
});

test("competitor filter respects all, core, and reference levels", () => {
  assert.equal(app.filterCompetitors("all", app.demoData).length, 10);
  assert.equal(app.filterCompetitors("core", app.demoData).length, 6);
  assert.equal(app.filterCompetitors("reference", app.demoData).length, 4);
});

test("alert filters expose customer-safe alert categories", () => {
  assert.equal(app.filterAlerts("all", app.demoData).length, app.demoData.alerts.length);
  assert.ok(app.filterAlerts("涨价", app.demoData).every((alert) => alert.filter === "涨价"));
  assert.ok(app.filterAlerts("降价", app.demoData).every((alert) => alert.filter === "降价"));
  assert.ok(app.filterAlerts("低价风险", app.demoData).every((alert) => alert.filter === "低价风险"));
  assert.ok(app.filterAlerts("市场均价", app.demoData).every((alert) => alert.filter === "市场均价"));
});

test("static shell contains all required views and no marketing hero gate", () => {
  const html = read(htmlPath);

  for (const id of ["overview-view", "calendar-view", "competitors-view", "alerts-view", "setup-view"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }

  assert.match(html, /data-view="overview"/);
  assert.match(html, /data-view="calendar"/);
  assert.match(html, /data-view="competitors"/);
  assert.match(html, /data-view="alerts"/);
  assert.match(html, /data-view="setup"/);
  assert.doesNotMatch(html, /hero|落地页|立即购买/i);
});

test("prototype files remain local demo only and avoid unsafe pricing claims", () => {
  const combined = [appPath, htmlPath, cssPath, readmePath].map(read).join("\n");

  for (const forbidden of [
    "fetch(",
    "XMLHttpRequest",
    "localStorage",
    "document.cookie",
    "cookie",
    "token",
    "验证码",
    "爬虫",
    "抓取",
    "自动调价",
    "自动改价",
  ]) {
    assert.equal(
      combined.toLowerCase().includes(forbidden.toLowerCase()),
      false,
      `found forbidden text: ${forbidden}`,
    );
  }

  assert.match(combined, /演示数据|样例数据/);
  assert.match(combined, /需人工复核/);
  assert.match(combined, /建议关注/);
});

test("investor demo data includes four room types and four demo platforms", () => {
  const roomLabels = app.demoData.roomTypes.map((roomType) => roomType.label);
  const platformLabels = app.demoData.platforms.map((platform) => platform.label);

  assert.equal(app.demoData.roomTypes.length, 4);
  assert.deepEqual(roomLabels, ["标准大床房", "标准双床房", "亲子房", "套房"]);
  assert.equal(app.demoData.platforms.length, 4);
  assert.deepEqual(platformLabels, ["携程演示源", "美团演示源", "飞猪演示源", "同程演示源"]);
});

test("demand events cover weekday, weekend, holiday, exhibition, and concert demo contexts", () => {
  const eventTypes = new Set(app.demoData.demandEvents.map((event) => event.type));

  for (const type of ["weekday", "weekend", "holiday", "exhibition", "concert"]) {
    assert.equal(eventTypes.has(type), true, `missing event type ${type}`);
  }

  assert.ok(
    app.demoData.demandEvents.every((event) => /演示|样例/.test(event.sampleMarker)),
    "every demand event must be visibly marked as demo/sample data",
  );
});

test("investor metrics reflect selected room type and platform context", () => {
  const metrics = app.deriveInvestorMetrics("suite", "meituan", app.demoData);

  assert.equal(metrics.selectedRoomType.label, "套房");
  assert.equal(metrics.selectedPlatform.label, "美团演示源");
  assert.equal(metrics.roomCoverageCount, 4);
  assert.equal(metrics.platformCoverageCount, 4);
  assert.match(metrics.eventTrendLiftText, /演示/);
  assert.match(metrics.maxPlatformGap, /^CNY \d+/);
});

test("context-aware date detail includes event, selected room/platform, and room breakdown", () => {
  const detail = app.getDateDetail("2026-06-01", app.demoData, {
    roomTypeId: "family",
    platformId: "fliggy",
  });

  assert.equal(detail.selectedRoomType.label, "亲子房");
  assert.equal(detail.selectedPlatform.label, "飞猪演示源");
  assert.match(detail.demandEvent.label, /端午演示假期/);
  assert.equal(detail.roomBreakdown.length, 4);
  assert.ok(detail.roomBreakdown.every((room) => room.ownerRate > 0 && room.coreAverage > 0));
});

test("visual data helpers power trend charts, heatmap intensity, and platform bars", () => {
  const holidayIntensity = app.getCalendarIntensity("2026-06-01", "queen", "ctrip", app.demoData);
  const weekdayIntensity = app.getCalendarIntensity("2026-05-20", "queen", "ctrip", app.demoData);
  const trendSeries = app.getTrendSeries("queen", "ctrip", app.demoData);
  const platformComparison = app.getPlatformComparison("suite", "2026-06-01", app.demoData);

  assert.ok(holidayIntensity.score > weekdayIntensity.score);
  assert.equal(app.getRoomBreakdown("2026-06-01", "ctrip", app.demoData).length, 4);
  assert.equal(trendSeries.ownerSeries.length, 30);
  assert.equal(trendSeries.coreAverageSeries.length, 30);
  assert.ok(trendSeries.eventMarkers.some((marker) => marker.type === "holiday"));
  assert.equal(platformComparison.length, 4);
  assert.ok(platformComparison.every((row) => row.platformLabel && row.ownerRate > 0 && row.coreAverage > 0));
  assert.ok(platformComparison.some((row) => row.gapAmount !== 0));
});

test("enhanced alerts include room type, platform gap, and holiday/event trend narratives", () => {
  const filters = new Set(app.demoData.alerts.map((alert) => alert.filter));

  assert.equal(filters.has("房型价差"), true);
  assert.equal(filters.has("平台价差"), true);
  assert.equal(filters.has("节假日趋势"), true);

  for (const alert of app.demoData.alerts) {
    assert.ok(alert.roomTypeId, `missing roomTypeId for ${alert.id}`);
    assert.ok(alert.platformId, `missing platformId for ${alert.id}`);
    assert.ok(alert.eventContext, `missing eventContext for ${alert.id}`);
    assert.match(alert.rationale, /需人工复核|人工复核/);
  }
});

test("investor visual contract includes chart modules and avoids placeholder chart copy", () => {
  const css = read(cssPath);
  const combined = [appPath, htmlPath, cssPath, readmePath].map(read).join("\n");

  for (const className of ["trend-chart", "heatmap", "platform-bars", "event-timeline", "mini-sparkline"]) {
    assert.match(css, new RegExp(`\\.${className}`), `missing visual class ${className}`);
  }

  assert.doesNotMatch(combined, /Chart 1|Lorem|placeholder/i);
  assert.match(combined, /投资人演示|平台价差|事件趋势/);
});
