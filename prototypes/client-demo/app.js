(function attachClientDemo(root) {
  const source = {
    name: "携程演示源",
    captureTime: "2026-05-18 08:30",
    note: "演示数据 · 样例数据 · CNY · 含税费估算 · 按房型标准化",
  };

  const ownerHotel = {
    name: "云栖城市酒店",
    area: "杭州 · 钱江新城商圈",
    occupancy: "2-4 人",
    currentRate: 368,
  };

  const roomTypes = [
    { id: "queen", label: "标准大床房", category: "基础房型", capacity: "2 人", baseOwnerRate: 368, normalizationNote: "含税费估算 · 双人入住 · 可取消" },
    { id: "twin", label: "标准双床房", category: "基础房型", capacity: "2 人", baseOwnerRate: 386, normalizationNote: "含税费估算 · 双床可比口径" },
    { id: "family", label: "亲子房", category: "家庭房型", capacity: "3-4 人", baseOwnerRate: 528, normalizationNote: "含税费估算 · 亲子设施口径" },
    { id: "suite", label: "套房", category: "高价值房型", capacity: "2 人", baseOwnerRate: 688, normalizationNote: "含税费估算 · 行政套房口径" },
  ];

  const platforms = [
    { id: "ctrip", label: "携程演示源", sampleCoverage: "92%", caveat: "样例覆盖较高", priceOffset: 0, ownerOffset: 0 },
    { id: "meituan", label: "美团演示源", sampleCoverage: "86%", caveat: "部分竞品活动价需复核", priceOffset: -18, ownerOffset: -10 },
    { id: "fliggy", label: "飞猪演示源", sampleCoverage: "78%", caveat: "亲子房样本较强", priceOffset: 22, ownerOffset: 12 },
    { id: "ly", label: "同程演示源", sampleCoverage: "74%", caveat: "套房样本偏少", priceOffset: 34, ownerOffset: 18 },
  ];

  const competitors = [
    { id: "c01", name: "锦澜商务酒店", level: "core", distance: "0.4km", currentRate: 438, change: "+8%", status: "正常监测", spreadBias: 12 },
    { id: "c02", name: "和庭精选酒店", level: "core", distance: "0.8km", currentRate: 421, change: "+5%", status: "正常监测", spreadBias: -8 },
    { id: "c03", name: "江湾雅居酒店", level: "core", distance: "1.1km", currentRate: 459, change: "+12%", status: "正常监测", spreadBias: 18 },
    { id: "c04", name: "星河城市客栈", level: "core", distance: "1.5km", currentRate: 398, change: "-3%", status: "正常监测", spreadBias: -16 },
    { id: "c05", name: "泊岸轻居酒店", level: "core", distance: "1.7km", currentRate: 446, change: "+7%", status: "正常监测", spreadBias: 9 },
    { id: "c06", name: "悦程行政公寓", level: "core", distance: "2.0km", currentRate: 472, change: "+10%", status: "正常监测", spreadBias: 21 },
    { id: "r01", name: "橙寓江景酒店", level: "reference", distance: "2.8km", currentRate: 389, change: "-24%", status: "参考监测", spreadBias: -26 },
    { id: "r02", name: "新城悦享酒店", level: "reference", distance: "3.1km", currentRate: 502, change: "+4%", status: "参考监测", spreadBias: 11 },
    { id: "r03", name: "湖滨小筑公寓", level: "reference", distance: "3.7km", currentRate: 356, change: "-6%", status: "参考监测", spreadBias: -18 },
    { id: "r04", name: "领航商旅酒店", level: "reference", distance: "4.2km", currentRate: 528, change: "+9%", status: "参考监测", spreadBias: 24 },
  ];

  function addDays(date, offset) {
    const next = new Date(`${date}T00:00:00+08:00`);
    next.setDate(next.getDate() + offset);
    return next.toISOString().slice(0, 10);
  }

  function isWeekend(date) {
    const day = new Date(`${date}T00:00:00+08:00`).getDay();
    return day === 0 || day === 6;
  }

  function labelForDate(date) {
    return `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`;
  }

  function eventForDate(date) {
    if (["2026-05-31", "2026-06-01", "2026-06-02"].includes(date)) {
      return { date, label: "端午演示假期", type: "holiday", expectedLift: 32, confidence: "高", sampleMarker: "演示假期样例" };
    }
    if (["2026-06-06", "2026-06-07"].includes(date)) {
      return { date, label: "会展演示日", type: "exhibition", expectedLift: 24, confidence: "中", sampleMarker: "演示会展样例" };
    }
    if (date === "2026-06-13") {
      return { date, label: "演唱会演示日", type: "concert", expectedLift: 28, confidence: "中", sampleMarker: "演示演出样例" };
    }
    if (isWeekend(date)) {
      return { date, label: "周末", type: "weekend", expectedLift: 16, confidence: "中", sampleMarker: "周末演示样例" };
    }
    return { date, label: "普通工作日", type: "weekday", expectedLift: 3, confidence: "常规", sampleMarker: "工作日样例数据" };
  }

  const demandEvents = Array.from({ length: 30 }, (_, index) => eventForDate(addDays("2026-05-18", index + 1)));

  const alerts = [
    {
      id: "a01",
      filter: "涨价",
      type: "周末上行",
      severity: "high",
      date: "2026-05-30",
      roomTypeId: "queen",
      platformId: "ctrip",
      eventContext: "周末",
      title: "周末核心竞品均价上升 16%",
      movement: "+16%",
      oldRate: 428,
      newRate: 497,
      rationale: "核心竞品周六价格同步上行，本酒店仍低于核心均价，建议关注周末库存和活动口径，需人工复核。",
    },
    {
      id: "a02",
      filter: "降价",
      type: "竞品下调",
      severity: "medium",
      date: "2026-05-24",
      roomTypeId: "queen",
      platformId: "meituan",
      eventContext: "周末",
      title: "橙寓江景酒店最低价下降 24%",
      movement: "-24%",
      oldRate: 512,
      newRate: 389,
      rationale: "市场参考酒店出现明显降价，建议人工复核该酒店房型和取消政策是否一致。",
    },
    {
      id: "a03",
      filter: "低价风险",
      type: "本酒店偏低",
      severity: "high",
      date: "2026-05-31",
      roomTypeId: "queen",
      platformId: "ctrip",
      eventContext: "端午演示假期",
      title: "本酒店低于核心竞品均价 18%",
      movement: "-18%",
      oldRate: 449,
      newRate: 368,
      rationale: "本酒店公开最低价低于核心竞品均价，需人工复核是否为主动促销或口径差异。",
    },
    {
      id: "a04",
      filter: "市场均价",
      type: "样本不足",
      severity: "info",
      date: "2026-06-03",
      roomTypeId: "twin",
      platformId: "ly",
      eventContext: "普通工作日",
      title: "该日期可比样本不足",
      movement: "样本不足",
      oldRate: 0,
      newRate: 0,
      rationale: "部分竞品当日未展示可比房型，建议关注但不直接用于价格判断，需人工复核。",
    },
    {
      id: "a05",
      filter: "市场均价",
      type: "市场均价",
      severity: "medium",
      date: "2026-06-06",
      roomTypeId: "queen",
      platformId: "ctrip",
      eventContext: "会展演示日",
      title: "核心竞品均价高于本酒店 14%",
      movement: "+14%",
      oldRate: 431,
      newRate: 491,
      rationale: "核心竞品周末均价继续抬升，本酒店当前价差扩大，建议关注收益机会，需人工复核。",
    },
    {
      id: "a06",
      filter: "房型价差",
      type: "房型价差",
      severity: "medium",
      date: "2026-06-01",
      roomTypeId: "family",
      platformId: "fliggy",
      eventContext: "端午演示假期",
      title: "亲子房假期价差扩大",
      movement: "+22%",
      oldRate: 566,
      newRate: 692,
      rationale: "亲子房在端午演示假期出现更强上行，建议关注家庭客群库存，需人工复核。",
    },
    {
      id: "a07",
      filter: "平台价差",
      type: "平台价差",
      severity: "high",
      date: "2026-06-01",
      roomTypeId: "suite",
      platformId: "ly",
      eventContext: "端午演示假期",
      title: "套房跨平台最大价差超过 CNY 80",
      movement: "CNY 86",
      oldRate: 704,
      newRate: 790,
      rationale: "同程演示源套房样例价高于其他平台，建议关注渠道一致性和样本质量，需人工复核。",
    },
    {
      id: "a08",
      filter: "节假日趋势",
      type: "事件趋势",
      severity: "high",
      date: "2026-06-13",
      roomTypeId: "queen",
      platformId: "ctrip",
      eventContext: "演唱会演示日",
      title: "演唱会演示日核心均价抬升",
      movement: "+28%",
      oldRate: 462,
      newRate: 591,
      rationale: "事件演示样例显示需求抬升，本酒店仍需人工复核房态、竞品可比口径和活动限制。",
    },
  ];

  function getRoomType(id = "queen", data = demoData) {
    return data.roomTypes.find((roomType) => roomType.id === id) || data.roomTypes[0];
  }

  function getPlatform(id = "ctrip", data = demoData) {
    return data.platforms.find((platform) => platform.id === id) || data.platforms[0];
  }

  function getDemandEvent(date, data = demoData) {
    return data.demandEvents.find((event) => event.date === date) || eventForDate(date);
  }

  function makeRateDays() {
    return Array.from({ length: 30 }, (_, index) => {
      const date = addDays("2026-05-18", index + 1);
      const rate = getRateForContext(date, "queen", "ctrip", {
        roomTypes,
        platforms,
        demandEvents,
      });
      const matchingAlert = alerts.find((alert) => alert.date === date);

      return {
        date,
        label: labelForDate(date),
        isWeekend: isWeekend(date),
        averageRate: rate.coreAverage,
        minRate: rate.minRate,
        maxRate: rate.maxRate,
        ownerRate: rate.ownerRate,
        movement: rate.movementText,
        tag: matchingAlert ? matchingAlert.type : rate.demandEvent.label,
        sampleSize: rate.sampleSize,
        alertReason: matchingAlert ? matchingAlert.rationale : `${rate.demandEvent.label}样例走势，建议关注但需人工复核。`,
      };
    });
  }

  const demoData = {
    source,
    ownerHotel,
    roomTypes,
    platforms,
    demandEvents,
    competitors,
    alerts,
    rateDays: [],
  };
  demoData.rateDays = makeRateDays();

  function formatCurrency(value) {
    if (!value) return "未形成可比价";
    return `CNY ${Math.round(value)}`;
  }

  function rateWave(date) {
    const day = Number(date.slice(8, 10));
    return [0, 8, -6, 11, 18, 24, 34][day % 7];
  }

  function getRateForContext(date, roomTypeId = "queen", platformId = "ctrip", data = demoData) {
    const roomType = getRoomType(roomTypeId, data);
    const platform = getPlatform(platformId, data);
    const demandEvent = getDemandEvent(date, data);
    const wave = rateWave(date);
    const roomPremium = roomType.baseOwnerRate - data.roomTypes[0].baseOwnerRate;
    const eventLift = demandEvent.expectedLift;
    const coreAverage = roomType.baseOwnerRate + 58 + platform.priceOffset + eventLift + wave;
    const ownerRate = roomType.baseOwnerRate + platform.ownerOffset + Math.round(eventLift * 0.45) + Math.round(wave * 0.25);
    const minRate = coreAverage - 42 - Math.round(roomPremium * 0.04);
    const maxRate = coreAverage + 54 + Math.round(eventLift * 0.6);
    const movementValue = Math.max(2, Math.round((eventLift + Math.max(wave, 0)) / 2));

    return {
      date,
      roomType,
      platform,
      demandEvent,
      ownerRate,
      coreAverage,
      minRate,
      maxRate,
      movementValue,
      movementText: `+${movementValue}%`,
      sampleSize: demandEvent.type === "weekday" ? 10 : demandEvent.type === "holiday" ? 12 : 8,
      sampleQuality: demandEvent.type === "weekday" ? "样本稳定" : `${demandEvent.sampleMarker} · ${demandEvent.confidence}可信`,
    };
  }

  function deriveOverviewMetrics(data = demoData, context = {}) {
    const roomTypeId = context.roomTypeId || "queen";
    const platformId = context.platformId || "ctrip";
    const selectedRate = getRateForContext("2026-05-30", roomTypeId, platformId, data);

    return {
      marketMovement: "+16%",
      alertCount: data.alerts.length,
      weekendOpportunity: `周末核心均价上行，建议关注 ${labelForDate("2026-05-30")} ${selectedRate.roomType.label}`,
      ownerRisk: `低于核心竞品均价 18% · ${selectedRate.platform.label}`,
      recommendation: "建议关注周末价格带、跨平台价差和事件趋势，所有调整需人工复核。",
    };
  }

  function deriveInvestorMetrics(roomTypeId = "queen", platformId = "ctrip", data = demoData) {
    const selectedRoomType = getRoomType(roomTypeId, data);
    const selectedPlatform = getPlatform(platformId, data);
    const comparison = getPlatformComparison(roomTypeId, "2026-06-01", data);
    const maxGap = comparison.reduce((max, row) => Math.max(max, Math.abs(row.gapAmount)), 0);
    const event = getDemandEvent("2026-06-01", data);

    return {
      selectedRoomType,
      selectedPlatform,
      roomCoverageCount: data.roomTypes.length,
      platformCoverageCount: data.platforms.length,
      eventTrendLiftText: `${event.label}样例抬升 +${event.expectedLift}%`,
      maxPlatformGap: formatCurrency(maxGap),
      maxPlatformGapValue: maxGap,
      sampleQuality: `${selectedPlatform.sampleCoverage} 覆盖 · ${selectedPlatform.caveat}`,
    };
  }

  function filterCompetitors(level = "all", data = demoData) {
    if (level === "all") return data.competitors;
    return data.competitors.filter((item) => item.level === level);
  }

  function filterAlerts(filter = "all", data = demoData) {
    if (filter === "all") return data.alerts;
    return data.alerts.filter((alert) => alert.filter === filter);
  }

  function competitorRateForDate(competitor, date, roomTypeId, platformId, data = demoData) {
    const rate = getRateForContext(date, roomTypeId, platformId, data);
    const numericChange = Number.parseInt(competitor.change, 10) || 0;
    return Math.round(rate.coreAverage + competitor.spreadBias + numericChange * 1.5);
  }

  function competitorSparkline(competitor, roomTypeId, platformId, data = demoData) {
    return data.rateDays.slice(0, 7).map((day) => {
      const rate = competitorRateForDate(competitor, day.date, roomTypeId, platformId, data);
      return rate + Math.round(competitor.spreadBias * 0.4);
    });
  }

  function getRoomBreakdown(date, platformId = "ctrip", data = demoData) {
    return data.roomTypes.map((roomType) => {
      const rate = getRateForContext(date, roomType.id, platformId, data);
      return {
        roomTypeId: roomType.id,
        label: roomType.label,
        ownerRate: rate.ownerRate,
        coreAverage: rate.coreAverage,
        gap: rate.coreAverage - rate.ownerRate,
      };
    });
  }

  function getCalendarIntensity(date, roomTypeId = "queen", platformId = "ctrip", data = demoData) {
    const rate = getRateForContext(date, roomTypeId, platformId, data);
    const score = rate.demandEvent.expectedLift + Math.abs(rate.movementValue);
    const level = score >= 42 ? "high" : score >= 28 ? "medium" : score >= 18 ? "low" : "base";
    return { score, level, label: rate.demandEvent.label };
  }

  function getTrendSeries(roomTypeId = "queen", platformId = "ctrip", data = demoData) {
    const points = data.rateDays.map((day) => getRateForContext(day.date, roomTypeId, platformId, data));
    return {
      ownerSeries: points.map((point) => ({ date: point.date, value: point.ownerRate })),
      coreAverageSeries: points.map((point) => ({ date: point.date, value: point.coreAverage })),
      eventLiftSeries: points.map((point) => ({ date: point.date, value: point.demandEvent.expectedLift })),
      eventMarkers: points
        .filter((point) => ["holiday", "exhibition", "concert"].includes(point.demandEvent.type))
        .map((point) => ({
          date: point.date,
          label: point.demandEvent.label,
          type: point.demandEvent.type,
          lift: point.demandEvent.expectedLift,
        })),
    };
  }

  function getPlatformComparison(roomTypeId = "queen", date = "2026-06-01", data = demoData) {
    return data.platforms.map((platform) => {
      const rate = getRateForContext(date, roomTypeId, platform.id, data);
      return {
        platformId: platform.id,
        platformLabel: platform.label,
        ownerRate: rate.ownerRate,
        coreAverage: rate.coreAverage,
        gapAmount: rate.coreAverage - rate.ownerRate,
        coverage: platform.sampleCoverage,
        caveat: platform.caveat,
      };
    });
  }

  function getDateDetail(date, data = demoData, context = {}) {
    const roomTypeId = context.roomTypeId || state.activeRoomType || "queen";
    const platformId = context.platformId || state.activePlatform || "ctrip";
    const rate = getRateForContext(date, roomTypeId, platformId, data);
    const dayIndex = data.rateDays.findIndex((item) => item.date === date);
    const competitorRows = data.competitors.map((competitor) => ({
      ...competitor,
      dateRate: competitorRateForDate(competitor, date, roomTypeId, platformId, data),
      source: rate.platform.label,
      platformGap: Math.abs(competitor.spreadBias) + Math.max(0, rate.demandEvent.expectedLift - 12),
      sparkline: competitorSparkline(competitor, roomTypeId, platformId, data),
    }));

    return {
      date,
      label: labelForDate(date),
      isWeekend: isWeekend(date),
      selectedRoomType: rate.roomType,
      selectedPlatform: rate.platform,
      demandEvent: rate.demandEvent,
      averageRate: rate.coreAverage,
      minRate: rate.minRate,
      maxRate: rate.maxRate,
      ownerRate: rate.ownerRate,
      movement: rate.movementText,
      tag: rate.demandEvent.label,
      sampleSize: rate.sampleSize,
      sampleQuality: rate.sampleQuality,
      competitorRows,
      roomBreakdown: getRoomBreakdown(date, platformId, data),
      platformComparison: getPlatformComparison(roomTypeId, date, data),
      alertReason: `${rate.demandEvent.label}下 ${rate.roomType.label} 在 ${rate.platform.label} 的核心均价为 ${formatCurrency(rate.coreAverage)}，建议关注并需人工复核。`,
      dayIndex,
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  const state = {
    activeView: "overview",
    activeDate: "2026-06-01",
    competitorLevel: "all",
    alertFilter: "all",
    selectedAlertId: "a07",
    activeRoomType: "queen",
    activePlatform: "ctrip",
    activeDemandFilter: "all",
  };

  function levelLabel(level) {
    return level === "core" ? "核心竞品" : "市场参考";
  }

  function severityLabel(severity) {
    return { high: "高", medium: "中", info: "提示" }[severity] || "提示";
  }

  function tagClass(dayOrRate) {
    const tag = dayOrRate.tag || dayOrRate.label || "";
    const movement = dayOrRate.movement || dayOrRate.movementText || "";
    if (tag.includes("演唱会") || tag.includes("端午") || tag.includes("会展")) return "event";
    if (movement.startsWith("+")) return "up";
    if (movement.startsWith("-")) return "down";
    if (tag.includes("样本")) return "info";
    return "watch";
  }

  function trendPath(series, width, height, min, max) {
    return series.map((point, index) => {
      const x = (index / Math.max(series.length - 1, 1)) * width;
      const y = height - ((point.value - min) / Math.max(max - min, 1)) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }

  function renderTrendChart(roomTypeId, platformId, data = demoData) {
    const series = getTrendSeries(roomTypeId, platformId, data);
    const values = [...series.ownerSeries, ...series.coreAverageSeries].map((point) => point.value);
    const min = Math.min(...values) - 20;
    const max = Math.max(...values) + 20;
    const width = 640;
    const height = 220;
    const ownerPath = trendPath(series.ownerSeries, width, height, min, max);
    const corePath = trendPath(series.coreAverageSeries, width, height, min, max);
    const markerTypes = new Set();
    const keyMarkers = series.eventMarkers.filter((marker) => {
      if (markerTypes.has(marker.type)) return false;
      markerTypes.add(marker.type);
      return true;
    });
    const markerHtml = keyMarkers.map((marker) => {
      const index = series.ownerSeries.findIndex((point) => point.date === marker.date);
      const x = (index / Math.max(series.ownerSeries.length - 1, 1)) * width;
      const shortLabel = marker.label.replace("演示", "");
      return `<g class="event-marker"><line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${height}" /><text x="${Math.min(x + 6, width - 92).toFixed(1)}" y="18">${escapeHtml(shortLabel)}</text></g>`;
    }).join("");

    return `
      <div class="trend-chart" aria-label="市场趋势线">
        <svg viewBox="0 0 ${width} ${height}" role="img">
          <defs>
            <linearGradient id="eventFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#fff0cf" stop-opacity="0.78" />
              <stop offset="100%" stop-color="#fff0cf" stop-opacity="0" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="${width}" height="${height}" fill="url(#eventFill)" opacity="0.32" />
          <line class="grid-line" x1="0" y1="${height * 0.25}" x2="${width}" y2="${height * 0.25}" />
          <line class="grid-line" x1="0" y1="${height * 0.5}" x2="${width}" y2="${height * 0.5}" />
          <line class="grid-line" x1="0" y1="${height * 0.75}" x2="${width}" y2="${height * 0.75}" />
          ${markerHtml}
          <path class="trend-line core" d="${corePath}" />
          <path class="trend-line owner" d="${ownerPath}" />
        </svg>
        <div class="chart-legend">
          <span><i class="legend owner"></i>本酒店价</span>
          <span><i class="legend core"></i>核心竞品均价</span>
          <span><i class="legend event"></i>事件影响</span>
        </div>
      </div>
    `;
  }

  function renderSparkline(values) {
    const width = 86;
    const height = 26;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const path = values.map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / Math.max(max - min, 1)) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    return `<svg class="mini-sparkline" viewBox="0 0 ${width} ${height}" aria-hidden="true"><path d="${path}" /></svg>`;
  }

  function renderPlatformBars(roomTypeId, date, data = demoData) {
    const rows = getPlatformComparison(roomTypeId, date, data);
    const maxGap = Math.max(...rows.map((row) => Math.abs(row.gapAmount)), 1);
    return `
      <div class="platform-bars" aria-label="平台价差条形图">
        ${rows.map((row) => `
          <div class="platform-bar-row">
            <div class="bar-label">
              <strong>${escapeHtml(row.platformLabel)}</strong>
              <span>${escapeHtml(row.coverage)} 覆盖</span>
            </div>
            <div class="bar-track">
              <span class="bar-fill ${row.gapAmount >= 0 ? "positive" : "negative"}" style="width: ${Math.max(12, Math.round((Math.abs(row.gapAmount) / maxGap) * 100))}%"></span>
            </div>
            <strong>${formatCurrency(Math.abs(row.gapAmount))}</strong>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderEventTimeline(data = demoData) {
    const seenTypes = new Set();
    const events = data.demandEvents.filter((event) => {
      if (!["holiday", "exhibition", "concert"].includes(event.type)) return false;
      if (seenTypes.has(event.type)) return false;
      seenTypes.add(event.type);
      return true;
    });
    return `
      <div class="event-timeline" aria-label="事件时间线">
        ${events.map((event) => `
          <div class="timeline-item ${event.type}">
            <span>${labelForDate(event.date)}</span>
            <strong>${escapeHtml(event.label)}</strong>
            <small>+${event.expectedLift}% · ${escapeHtml(event.sampleMarker)}</small>
          </div>
        `).join("")}
      </div>
    `;
  }

  function updateHeader(documentRef) {
    const platform = getPlatform(state.activePlatform, demoData);
    const roomType = getRoomType(state.activeRoomType, demoData);
    const platformNode = documentRef.getElementById("scope-platform");
    const roomNode = documentRef.getElementById("scope-room");
    if (platformNode) platformNode.textContent = platform.label;
    if (roomNode) roomNode.textContent = `${roomType.label} · ${roomType.normalizationNote}`;
  }

  function renderControls(documentRef) {
    const target = documentRef.getElementById("analysis-controls");
    if (!target) return;
    target.innerHTML = `
      <div class="control-block">
        <span>房型</span>
        <div class="control-options">
          ${demoData.roomTypes.map((roomType) => `<button type="button" class="${state.activeRoomType === roomType.id ? "active" : ""}" data-room-type="${roomType.id}">${escapeHtml(roomType.label)}</button>`).join("")}
        </div>
      </div>
      <div class="control-block">
        <span>平台</span>
        <div class="control-options">
          ${demoData.platforms.map((platform) => `<button type="button" class="${state.activePlatform === platform.id ? "active" : ""}" data-platform="${platform.id}">${escapeHtml(platform.label.replace("演示源", ""))}</button>`).join("")}
        </div>
      </div>
      <div class="control-block">
        <span>趋势上下文</span>
        <div class="control-options">
          ${[
            ["all", "全部事件"],
            ["holiday", "端午"],
            ["exhibition", "会展"],
            ["concert", "演唱会"],
          ].map(([id, label]) => `<button type="button" class="${state.activeDemandFilter === id ? "active" : ""}" data-demand-filter="${id}">${label}</button>`).join("")}
        </div>
      </div>
    `;

    target.querySelectorAll("[data-room-type]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeRoomType = button.dataset.roomType;
        renderAll(documentRef);
      });
    });
    target.querySelectorAll("[data-platform]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activePlatform = button.dataset.platform;
        renderAll(documentRef);
      });
    });
    target.querySelectorAll("[data-demand-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeDemandFilter = button.dataset.demandFilter;
        renderAll(documentRef);
      });
    });
  }

  function renderOverview(documentRef) {
    const metrics = deriveOverviewMetrics(demoData, { roomTypeId: state.activeRoomType, platformId: state.activePlatform });
    const investor = deriveInvestorMetrics(state.activeRoomType, state.activePlatform, demoData);
    const view = documentRef.getElementById("overview-view");
    const topAlerts = demoData.alerts.slice(5, 8);

    view.innerHTML = `
      <div class="dashboard-grid investor-grid">
        <section class="panel main-dashboard">
          <div class="panel-header">
            <div>
              <h2>投资人演示 · 市场智能看板</h2>
              <p>${escapeHtml(ownerHotel.area)} · ${escapeHtml(investor.selectedRoomType.label)} · ${escapeHtml(investor.selectedPlatform.label)} · ${escapeHtml(source.note)}</p>
            </div>
            <span class="badge demo">样例数据</span>
          </div>
          <div class="capability-strip">
            <div><span>房型覆盖</span><strong>${investor.roomCoverageCount} 类</strong><small>标准/家庭/套房</small></div>
            <div><span>平台覆盖</span><strong>${investor.platformCoverageCount} 个</strong><small>演示平台矩阵</small></div>
            <div><span>事件趋势</span><strong>${escapeHtml(investor.eventTrendLiftText)}</strong><small>假期/会展/演出</small></div>
            <div><span>价差洞察</span><strong>${escapeHtml(investor.maxPlatformGap)}</strong><small>跨平台最大价差</small></div>
          </div>
          <div class="kpi-grid refined">
            <div class="kpi"><span>市场变化</span><strong>${metrics.marketMovement}</strong><small>${escapeHtml(investor.selectedRoomType.label)} 周末样例走势</small>${renderSparkline(getTrendSeries(state.activeRoomType, state.activePlatform).coreAverageSeries.slice(0, 7).map((point) => point.value))}</div>
            <div class="kpi"><span>异常提醒</span><strong>${metrics.alertCount}</strong><small>含房型、平台和事件提醒</small>${renderSparkline([3, 4, 5, 5, 6, 8, 8])}</div>
            <div class="kpi"><span>平台样本</span><strong>${escapeHtml(investor.selectedPlatform.sampleCoverage)}</strong><small>${escapeHtml(investor.sampleQuality)}</small></div>
            <div class="kpi"><span>本酒店风险</span><strong>-18%</strong><small>${escapeHtml(metrics.ownerRisk)}</small></div>
          </div>
          <div class="chart-panel">
            <div class="chart-heading">
              <div>
                <h3>市场趋势线</h3>
                <p>本酒店价、核心竞品均价与事件影响，均为演示数据</p>
              </div>
              <span class="tag event">事件注释</span>
            </div>
            ${renderTrendChart(state.activeRoomType, state.activePlatform, demoData)}
          </div>
          <div class="recommendation">${escapeHtml(metrics.recommendation)}</div>
        </section>
        <aside class="panel insight-panel">
          <div class="panel-header">
            <div>
              <h3>平台价差与事件趋势</h3>
              <p>帮助投资人理解数据产品扩展空间</p>
            </div>
          </div>
          ${renderPlatformBars(state.activeRoomType, state.activeDate, demoData)}
          ${renderEventTimeline(demoData)}
          <div class="alert-list compact">
            ${topAlerts.map((alert) => alertSummary(alert)).join("")}
          </div>
        </aside>
      </div>
    `;
  }

  function alertSummary(alert) {
    const roomType = getRoomType(alert.roomTypeId, demoData);
    const platform = getPlatform(alert.platformId, demoData);
    return `
      <div class="alert-row">
        <div class="row-title">
          <strong>${escapeHtml(alert.title)}</strong>
          <span class="severity ${alert.severity}">${severityLabel(alert.severity)}</span>
        </div>
        <p class="meta">${escapeHtml(alert.date)} · ${escapeHtml(roomType.label)} · ${escapeHtml(platform.label)} · ${escapeHtml(alert.eventContext)} · 需人工复核</p>
      </div>
    `;
  }

  function renderCalendar(documentRef) {
    const view = documentRef.getElementById("calendar-view");
    const detail = getDateDetail(state.activeDate, demoData, {
      roomTypeId: state.activeRoomType,
      platformId: state.activePlatform,
    });
    const shownDays = state.activeDemandFilter === "all"
      ? demoData.rateDays
      : demoData.rateDays.filter((day) => getDemandEvent(day.date).type === state.activeDemandFilter);
    const days = shownDays.length ? shownDays : demoData.rateDays;

    view.innerHTML = `
      <div class="calendar-layout">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>热力价格日历</h2>
              <p>${escapeHtml(detail.selectedPlatform.label)} · ${escapeHtml(detail.selectedRoomType.label)} · 颜色强弱表示事件/价格波动强度</p>
            </div>
          </div>
          <div class="calendar-grid heatmap">
            ${days.map((day) => {
              const rate = getRateForContext(day.date, state.activeRoomType, state.activePlatform, demoData);
              const intensity = getCalendarIntensity(day.date, state.activeRoomType, state.activePlatform, demoData);
              return `
                <button class="calendar-cell heatmap heat-${intensity.level} ${day.date === state.activeDate ? "active" : ""}" type="button" data-date="${day.date}">
                  <span class="date-line"><span>${labelForDate(day.date)}</span><span>${escapeHtml(rate.demandEvent.label)}</span></span>
                  <strong>${formatCurrency(rate.coreAverage)}</strong>
                  <span class="meta">${formatCurrency(rate.minRate)} - ${formatCurrency(rate.maxRate)}</span>
                  <span class="tag ${tagClass(rate.demandEvent)}">${escapeHtml(rate.movementText)} · ${escapeHtml(rate.sampleQuality)}</span>
                </button>
              `;
            }).join("")}
          </div>
        </section>
        <aside class="panel detail-panel" aria-live="polite">
          ${dateDetailHtml(detail)}
        </aside>
      </div>
    `;

    view.querySelectorAll("[data-date]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeDate = button.dataset.date;
        renderCalendar(documentRef);
      });
    });
  }

  function dateDetailHtml(detail) {
    return `
      <h3>${escapeHtml(detail.date)} 入住详情</h3>
      <p class="meta">${escapeHtml(detail.selectedRoomType.label)} · ${escapeHtml(detail.selectedPlatform.label)} · ${escapeHtml(detail.demandEvent.label)} · 样本 ${detail.sampleSize} 家</p>
      <div class="kpi context-kpi">
        <span>核心竞品均价</span>
        <strong>${formatCurrency(detail.averageRate)}</strong>
        <small>本酒店 ${formatCurrency(detail.ownerRate)} · 范围 ${formatCurrency(detail.minRate)} - ${formatCurrency(detail.maxRate)}</small>
      </div>
      <p><strong>事件依据：</strong>${escapeHtml(detail.alertReason)}</p>
      <div class="room-breakdown">
        ${detail.roomBreakdown.map((row) => `
          <div>
            <span>${escapeHtml(row.label)}</span>
            <strong>${formatCurrency(row.coreAverage)}</strong>
            <small>价差 ${formatCurrency(row.gap)}</small>
          </div>
        `).join("")}
      </div>
      ${renderPlatformBars(detail.selectedRoomType.id, detail.date, demoData)}
    `;
  }

  function renderCompetitors(documentRef) {
    const view = documentRef.getElementById("competitors-view");
    const rows = filterCompetitors(state.competitorLevel, demoData);
    view.innerHTML = `
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>竞品监控 · 房型/平台上下文</h2>
            <p>${escapeHtml(getRoomType(state.activeRoomType).label)} · ${escapeHtml(getPlatform(state.activePlatform).label)} · 价格均为样例数据</p>
          </div>
        </div>
        <div class="segmented" aria-label="竞品层级筛选">
          ${competitorFilterButton("all", "全部 10 家")}
          ${competitorFilterButton("core", "核心竞品 6 家")}
          ${competitorFilterButton("reference", "市场参考 4 家")}
        </div>
        <div class="competitor-list">
          ${rows.map((row) => {
            const detail = getDateDetail(state.activeDate, demoData, { roomTypeId: state.activeRoomType, platformId: state.activePlatform });
            const competitorRow = detail.competitorRows.find((item) => item.id === row.id);
            return `
              <div class="competitor-row competitor-grid enhanced">
                <strong>${escapeHtml(row.name)}</strong>
                <span>${levelLabel(row.level)}</span>
                <span>${escapeHtml(row.distance)}</span>
                <span>${formatCurrency(competitorRow.dateRate)}</span>
                <span class="tag ${row.change.startsWith("-") ? "down" : "up"}">${escapeHtml(row.change)}</span>
                ${renderSparkline(competitorRow.sparkline)}
                <span class="meta">平台价差 ${formatCurrency(competitorRow.platformGap)}</span>
                <span>${escapeHtml(row.status)}</span>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    `;

    view.querySelectorAll("[data-level]").forEach((button) => {
      button.addEventListener("click", () => {
        state.competitorLevel = button.dataset.level;
        renderCompetitors(documentRef);
      });
    });
  }

  function competitorFilterButton(level, label) {
    return `<button type="button" class="${state.competitorLevel === level ? "active" : ""}" data-level="${level}">${label}</button>`;
  }

  function renderAlerts(documentRef) {
    const view = documentRef.getElementById("alerts-view");
    const rows = filterAlerts(state.alertFilter, demoData);
    const selected = rows.find((alert) => alert.id === state.selectedAlertId) || rows[0] || demoData.alerts[0];
    state.selectedAlertId = selected.id;
    const roomType = getRoomType(selected.roomTypeId);
    const platform = getPlatform(selected.platformId);
    view.innerHTML = `
      <div class="alerts-layout">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>异常提醒中心</h2>
              <p>房型、平台、事件趋势均为演示样例，所有建议需人工复核</p>
            </div>
          </div>
          <div class="alert-filter" aria-label="提醒类型筛选">
            ${["all", "涨价", "降价", "市场均价", "低价风险", "房型价差", "平台价差", "节假日趋势"].map((filter) => alertFilterButton(filter, filter === "all" ? "全部" : filter)).join("")}
          </div>
          <div class="alert-list">
            ${rows.map((alert) => {
              const alertRoom = getRoomType(alert.roomTypeId);
              const alertPlatform = getPlatform(alert.platformId);
              return `
                <button class="alert-row ${alert.id === state.selectedAlertId ? "active" : ""}" type="button" data-alert-id="${alert.id}">
                  <div class="row-title">
                    <strong>${escapeHtml(alert.title)}</strong>
                    <span class="severity ${alert.severity}">${severityLabel(alert.severity)}</span>
                  </div>
                  <p class="meta">${escapeHtml(alert.date)} · ${escapeHtml(alertRoom.label)} · ${escapeHtml(alertPlatform.label)} · ${escapeHtml(alert.eventContext)} · ${escapeHtml(alert.movement)} · 需人工复核</p>
                </button>
              `;
            }).join("")}
          </div>
        </section>
        <aside class="panel detail-panel" aria-live="polite">
          <h3>${escapeHtml(selected.title)}</h3>
          <p class="meta">${escapeHtml(selected.date)} · ${escapeHtml(roomType.label)} · ${escapeHtml(platform.label)} · ${escapeHtml(selected.eventContext)}</p>
          <div class="price-pair">
            <span>原参考：${formatCurrency(selected.oldRate)}</span>
            <span>新参考：${formatCurrency(selected.newRate)}</span>
            <span>变化：${escapeHtml(selected.movement)}</span>
          </div>
          <p><strong>建议关注：</strong>${escapeHtml(selected.rationale)}</p>
          <p><strong>复核标记：</strong>需人工复核房型、平台口径、取消政策、税费估算和样本数量。</p>
          ${renderPlatformBars(selected.roomTypeId, selected.date, demoData)}
        </aside>
      </div>
    `;

    view.querySelectorAll("[data-alert-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.alertFilter = button.dataset.alertFilter;
        state.selectedAlertId = "";
        renderAlerts(documentRef);
      });
    });

    view.querySelectorAll("[data-alert-id]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedAlertId = button.dataset.alertId;
        renderAlerts(documentRef);
      });
    });
  }

  function alertFilterButton(filter, label) {
    return `<button type="button" class="${state.alertFilter === filter ? "active" : ""}" data-alert-filter="${filter}">${label}</button>`;
  }

  function renderSetup(documentRef) {
    const view = documentRef.getElementById("setup-view");
    const steps = [
      ["确认房型矩阵", "维护标准大床房、标准双床房、亲子房、套房的标准化口径。"],
      ["连接演示平台", "对比携程、美团、飞猪、同程演示源的样例覆盖和价差。"],
      ["标注事件趋势", "维护端午、会展、演唱会等演示事件，观察价格热度变化。"],
      ["复核监测摘要", "所有洞察仅用于建议关注，决策前需人工复核。"],
    ];

    view.innerHTML = `
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>投资人演示设置预览</h2>
            <p>展示产品能从单店监测扩展为房型、平台、事件趋势的市场智能系统</p>
          </div>
          <span class="badge demo">演示流程</span>
        </div>
        <div class="setup-grid">
          ${steps.map((step, index) => `
            <div class="setup-step">
              <span class="step-number">${index + 1}</span>
              <h3>${escapeHtml(step[0])}</h3>
              <p class="meta">${escapeHtml(step[1])}</p>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderAll(documentRef) {
    updateHeader(documentRef);
    renderControls(documentRef);
    renderOverview(documentRef);
    renderCalendar(documentRef);
    renderCompetitors(documentRef);
    renderAlerts(documentRef);
    renderSetup(documentRef);
    activateView(state.activeView, documentRef);
  }

  function activateView(viewName, documentRef) {
    state.activeView = viewName;
    documentRef.querySelectorAll(".view").forEach((view) => {
      view.classList.toggle("active", view.dataset.panel === viewName);
    });
    documentRef.querySelectorAll(".nav-tab").forEach((button) => {
      const active = button.dataset.view === viewName;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function init(documentRef) {
    documentRef.querySelectorAll(".nav-tab").forEach((button) => {
      button.addEventListener("click", () => activateView(button.dataset.view, documentRef));
    });
    renderAll(documentRef);
  }

  const api = {
    demoData,
    deriveOverviewMetrics,
    deriveInvestorMetrics,
    filterCompetitors,
    filterAlerts,
    getRoomType,
    getPlatform,
    getDemandEvent,
    getRateForContext,
    getDateDetail,
    getCalendarIntensity,
    getRoomBreakdown,
    getTrendSeries,
    getPlatformComparison,
    formatCurrency,
    init,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.ClientDemoApp = api;

  if (root.document) {
    root.document.addEventListener("DOMContentLoaded", () => init(root.document));
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
