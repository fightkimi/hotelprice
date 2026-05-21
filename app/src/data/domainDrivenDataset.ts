import { generateAlertCandidates, isAlertableSnapshot, markStaleSnapshots } from '../domain/pricing';
import type { AlertCandidate, AlertableRateSnapshot, HotelProfile, RateSnapshot } from '../domain/pricing';
import type {
  AlertReviewEvidenceRow,
  AlertReviewItem,
  AlertReviewWorkflow,
  CalendarDayDetail,
  CalendarEventImpact,
  CalendarPlatformGapRow,
  CalendarRateBasis,
  ContextSelection,
  DemoDataset,
  EventMarker,
  EvidenceMarker,
  HeatmapDay,
  MarketCompetitorSample,
  MarketDrilldownDetail,
  MarketDrilldownOption,
  MarketSampleStatus,
  PlatformGapRow,
  PricePoint,
  RateKey,
  Signal,
  TrendSeries
} from '../types/contracts';
import { buildCaptureEntryPreview, buildDataScopeSummary } from './dataScope';
import { domainSeed, type DemoEventAnnotation, type DomainDemoSeed } from './domainSeed';

function yuan(priceCents: number): number {
  return Math.round(priceCents / 100);
}

function round(value: number): number {
  return Math.round(value);
}

function compareSnapshots(a: RateSnapshot, b: RateSnapshot): number {
  const byCapture = Date.parse(a.capturedAt) - Date.parse(b.capturedAt);
  if (byCapture !== 0) {
    return byCapture;
  }
  return a.snapshotId.localeCompare(b.snapshotId);
}

function latestSnapshot(snapshots: RateSnapshot[]): RateSnapshot | undefined {
  return [...snapshots].sort(compareSnapshots).at(-1);
}

function latestAlertable(snapshots: RateSnapshot[]): AlertableRateSnapshot | undefined {
  const latest = latestSnapshot(snapshots);
  return latest && isAlertableSnapshot(latest) ? latest : undefined;
}

function platformLabel(seed: DomainDemoSeed, sourceId: string): string {
  return seed.platforms.find((platform) => platform.sourceId === sourceId)?.label ?? sourceId;
}

function sourceIds(seed: DomainDemoSeed): Set<string> {
  return new Set(seed.platforms.map((platform) => platform.sourceId));
}

function ownerHotel(seed: DomainDemoSeed): HotelProfile {
  const owner = seed.hotels.find((hotel) => hotel.role === 'owner' && hotel.active);
  if (!owner) {
    throw new Error('Domain demo seed requires one active owner hotel.');
  }
  return owner;
}

function coreCompetitors(seed: DomainDemoSeed): HotelProfile[] {
  return seed.hotels.filter((hotel) => hotel.role === 'competitor' && hotel.competitorLevel === 'core' && hotel.active);
}

function displayDates(seed: DomainDemoSeed): string[] {
  return [...new Set(seed.snapshots.map((snapshot) => snapshot.rateKey.stayDate))].sort();
}

function primarySourceId(seed: DomainDemoSeed): string {
  return seed.platforms[0].sourceId;
}

function snapshotMatches(snapshot: RateSnapshot, params: { hotelId?: string; stayDate: string; sourceId: string }): boolean {
  return (
    snapshot.rateKey.stayDate === params.stayDate &&
    snapshot.rateKey.sourceId === params.sourceId &&
    (params.hotelId === undefined || snapshot.hotelId === params.hotelId)
  );
}

function latestForHotelDateSource(seed: DomainDemoSeed, hotelId: string, stayDate: string, sourceId: string): RateSnapshot | undefined {
  return latestSnapshot(seed.snapshots.filter((snapshot) => snapshotMatches(snapshot, { hotelId, stayDate, sourceId })));
}

function latestAvailableForHotelDateSource(seed: DomainDemoSeed, hotelId: string, stayDate: string, sourceId: string): AlertableRateSnapshot | undefined {
  return latestAlertable(seed.snapshots.filter((snapshot) => snapshotMatches(snapshot, { hotelId, stayDate, sourceId })));
}

function coreSamples(seed: DomainDemoSeed, stayDate: string, sourceId: string): AlertableRateSnapshot[] {
  return coreCompetitors(seed).flatMap((hotel) => {
    const sample = latestAvailableForHotelDateSource(seed, hotel.hotelId, stayDate, sourceId);
    return sample ? [sample] : [];
  });
}

function averageCents(samples: AlertableRateSnapshot[]): number | null {
  if (samples.length === 0) {
    return null;
  }
  return samples.reduce((sum, sample) => sum + sample.priceCents, 0) / samples.length;
}

function uiRateKey(seed: DomainDemoSeed, snapshot: RateSnapshot, platformOverride?: string): RateKey {
  return {
    hotelId: snapshot.hotelId,
    competitorGroupId: snapshot.competitorGroupId,
    roomType: seed.context.roomTypeLabel,
    platform: platformOverride ?? platformLabel(seed, snapshot.rateKey.sourceId),
    stayDate: snapshot.rateKey.stayDate,
    occupancy: snapshot.rateKey.occupancyAdults,
    mealPlan: snapshot.rateKey.mealPlan === 'double-breakfast' ? '双早' : snapshot.rateKey.mealPlan,
    taxFeeBasis: snapshot.rateKey.taxFeeBasis === 'included' ? '含税含服务费' : snapshot.rateKey.taxFeeBasis,
    cancellationPolicy: snapshot.rateKey.cancellationPolicy === 'free-cancel-24h' ? '入住前24小时可取消' : snapshot.rateKey.cancellationPolicy
  };
}

function point(seed: DomainDemoSeed, snapshot: RateSnapshot, value: number | null, platformOverride?: string): PricePoint {
  return {
    date: snapshot.rateKey.stayDate,
    value,
    currency: 'CNY',
    captureTime: snapshot.capturedAt,
    rateKey: uiRateKey(seed, snapshot, platformOverride),
    occupancy: snapshot.rateKey.occupancyAdults,
    mealPlan: snapshot.rateKey.mealPlan === 'double-breakfast' ? '双早' : snapshot.rateKey.mealPlan,
    taxFeeBasis: snapshot.rateKey.taxFeeBasis === 'included' ? '含税含服务费' : snapshot.rateKey.taxFeeBasis,
    cancellationPolicy: snapshot.rateKey.cancellationPolicy === 'free-cancel-24h' ? '入住前24小时可取消' : snapshot.rateKey.cancellationPolicy
  };
}

function representativeSnapshot(seed: DomainDemoSeed, stayDate: string, sourceId: string): RateSnapshot {
  const existing = latestForHotelDateSource(seed, seed.context.ownerHotelId, stayDate, sourceId);
  if (existing) {
    return existing;
  }

  const fallback = seed.snapshots.find((snapshot) => snapshot.rateKey.sourceId === sourceId) ?? seed.snapshots[0];
  return {
    ...fallback,
    snapshotId: `generated-ui-gap-${stayDate}-${sourceId}`,
    hotelId: seed.context.ownerHotelId,
    capturedAt: seed.now,
    availabilityStatus: 'unavailable',
    unavailableReason: 'fixture_ui_gap',
    priceCents: null,
    rateKey: {
      ...fallback.rateKey,
      stayDate,
      checkoutDate: fallback.rateKey.checkoutDate
    }
  };
}

function buildContext(seed: DomainDemoSeed): ContextSelection {
  return {
    property: seed.context.propertyName,
    roomType: seed.context.roomTypeLabel,
    platform: seed.platforms.map((platform) => platform.label).join(' / '),
    dateRange: seed.context.dateRange,
    competitorGroup: '核心竞品组 A：同商圈中高端酒店',
    demandContext: seed.context.demandContext,
    captureTime: seed.context.captureLabel
  };
}

function signalSeverity(alert: AlertCandidate): Signal['severity'] {
  if (alert.severity === 'risk') {
    return 'risk';
  }
  if (alert.severity === 'warning') {
    return 'warning';
  }
  return 'normal';
}

function signalTitle(alert: AlertCandidate): string {
  const titles: Record<AlertCandidate['alertType'], string> = {
    competitor_increase: '核心竞品价格上行',
    competitor_decrease: '核心竞品价格回落',
    market_increase: '核心竞品均价上行',
    market_decrease: '核心竞品均价回落',
    owner_low_risk: '本酒店低于核心竞品',
    owner_high_risk: '本酒店高于核心竞品'
  };
  return titles[alert.alertType];
}

function signalSummary(alert: AlertCandidate): string {
  const changePercent = Math.round(alert.changeRate * 100);
  const direction = changePercent > 0 ? `上行 ${changePercent}%` : `下行 ${Math.abs(changePercent)}%`;

  if (alert.alertType === 'owner_low_risk') {
    return `本酒店样例价低于核心竞品均价 ${Math.abs(changePercent)}%，建议进入人工复核队列。`;
  }
  if (alert.alertType === 'owner_high_risk') {
    return `本酒店样例价高于核心竞品均价 ${changePercent}%，建议进入人工复核队列。`;
  }
  if (alert.alertType.startsWith('market')) {
    return `核心竞品均价较上一观察点${direction}，需要结合事件和房态进行人工复核。`;
  }
  return `单个核心竞品较上一观察点${direction}，用于提示人工复核优先级。`;
}

function primaryMetric(alert: AlertCandidate): number {
  if (alert.oldPriceCents !== null && alert.newPriceCents !== null) {
    return Math.round((alert.newPriceCents - alert.oldPriceCents) / 100);
  }
  return Math.round(alert.changeRate * 100);
}

function evidenceRoleLabel(role: AlertCandidate['evidence'][number]['role']): string {
  const labels: Record<AlertCandidate['evidence'][number]['role'], string> = {
    latest_observation: '最新观测',
    previous_observation: '上一观测',
    market_sample: '市场样本',
    owner_observation: '本酒店观测',
    competitor_sample: '核心竞品样本'
  };
  return labels[role];
}

function mapEvidence(seed: DomainDemoSeed, alert: AlertCandidate): EvidenceMarker[] {
  return alert.evidence.map((evidence) => ({
    label: `${evidenceRoleLabel(evidence.role)} · ${alert.rateKey.roomTypeKey} · ${alert.rateKey.stayDate}`,
    source: platformLabel(seed, alert.rateKey.sourceId),
    captureTime: evidence.capturedAt,
    sampleSize: evidence.sampleSize,
    confidence: evidence.sampleSize >= 3 ? 'sample' : 'partial'
  }));
}

function mapAlertToSignal(seed: DomainDemoSeed, alert: AlertCandidate): Signal {
  return {
    id: alert.alertId,
    title: signalTitle(alert),
    primaryMetric: primaryMetric(alert),
    metricUnit: alert.oldPriceCents !== null && alert.newPriceCents !== null ? 'CNY' : '%',
    summary: signalSummary(alert),
    severity: signalSeverity(alert),
    humanReviewRequired: alert.requiresHumanReview,
    evidenceMarkers: mapEvidence(seed, alert)
  };
}

function reviewPriority(alert: AlertCandidate): AlertReviewItem['reviewPriority'] {
  if (alert.alertType === 'owner_low_risk' || alert.alertType === 'owner_high_risk') {
    return 'high';
  }
  if (alert.alertType === 'market_increase' || alert.alertType === 'market_decrease') {
    return 'medium';
  }
  return 'watch';
}

function alertReviewEvidenceRows(seed: DomainDemoSeed, alert: AlertCandidate): AlertReviewEvidenceRow[] {
  return alert.evidence.map((evidence) => ({
    role: evidence.role,
    label: `${evidenceRoleLabel(evidence.role)} · ${alert.rateKey.roomTypeKey} · ${alert.rateKey.stayDate}`,
    source: platformLabel(seed, alert.rateKey.sourceId),
    captureTime: evidence.capturedAt,
    sampleSize: evidence.sampleSize,
    confidence: evidence.sampleSize >= 3 ? 'sample' : evidence.sampleSize > 0 ? 'partial' : 'unavailable',
    price: evidence.priceCents === null ? null : yuan(evidence.priceCents),
    status: evidence.priceCents === null ? 'missing-sample' : 'available'
  }));
}

function alertReviewRateKey(seed: DomainDemoSeed, alert: AlertCandidate): RateKey {
  const snapshot = representativeSnapshot(seed, alert.rateKey.stayDate, alert.rateKey.sourceId);
  return uiRateKey(seed, {
    ...snapshot,
    hotelId: alert.hotelId,
    competitorGroupId: alert.competitorGroupId,
    rateKey: alert.rateKey
  });
}

function buildAlertReviewWorkflow(seed: DomainDemoSeed, alerts: AlertCandidate[], signals: Signal[]): AlertReviewWorkflow {
  const signalById = new Map(signals.map((signal) => [signal.id, signal]));
  const items = alerts.map((alert): AlertReviewItem => {
    const signal = signalById.get(alert.alertId);
    if (!signal) {
      throw new Error(`Missing UI signal for alert ${alert.alertId}`);
    }
    const evidenceRows = alertReviewEvidenceRows(seed, alert);
    const captureTime = evidenceRows[0]?.captureTime ?? seed.now;

    return {
      id: `review-${alert.alertId}`,
      signalId: signal.id,
      alertType: alert.alertType,
      title: signal.title,
      summary: signal.summary,
      severity: signal.severity,
      primaryMetric: signal.primaryMetric,
      metricUnit: signal.metricUnit,
      affectedStayDate: alert.rateKey.stayDate,
      reviewPriority: reviewPriority(alert),
      defaultStatus: 'needs_review',
      defaultNote: '本地复核备注：等待收益经理核对房态、库存和竞品样本。',
      rateKey: alertReviewRateKey(seed, alert),
      evidenceRows,
      sampleSize: alert.sampleSize,
      captureTime,
      humanReviewRequired: true
    };
  });

  return {
    items,
    selectedItemId: items[0]?.id ?? '',
    statusOptions: [
      { id: 'needs_review', label: '待复核', description: '进入人工复核队列，尚未记录判断。' },
      { id: 'reviewing', label: '复核中', description: '收益经理正在核对样本与房态。' },
      { id: 'noted', label: '已记录', description: '仅在本页记录人工关注点，不保存到生产系统。' }
    ],
    notePresets: [
      { id: 'check-inventory', label: '核对房态', text: '需要核对本酒店库存、房态和取消政策后再判断。' },
      { id: 'check-samples', label: '核对样本', text: '需要确认核心竞品样本是否仍然可用且口径一致。' },
      { id: 'owner-watch', label: '人工关注', text: '已记录为人工关注项，不触发任何自动价格动作。' }
    ],
    guardrails: ['本页仅使用 fixture/manual 演示数据。', '复核状态和备注仅保存在当前页面本地状态。', '所有价格动作必须人工复核并确认。']
  };
}

function eventForDate(seed: DomainDemoSeed, date: string): DemoEventAnnotation | undefined {
  return seed.events.find((event) => event.date === date);
}

function buildEventMarkers(seed: DomainDemoSeed): EventMarker[] {
  return seed.events.flatMap((event) => {
    if (event.type === 'weekend') {
      return [];
    }
    return [
      {
        date: event.date,
        label: event.label,
        type: event.type,
        lift: event.lift,
        confidence: event.confidence
      }
    ];
  });
}

function buildTrend(seed: DomainDemoSeed): DemoDataset['trend'] {
  const owner = ownerHotel(seed);
  const sourceId = primarySourceId(seed);
  const dates = displayDates(seed);
  const ownerPoints = dates.map((date) => {
    const snapshot = representativeSnapshot(seed, date, sourceId);
    const available = latestAvailableForHotelDateSource(seed, owner.hotelId, date, sourceId);
    return point(seed, snapshot, available ? yuan(available.priceCents) : null);
  });

  const corePoints = dates.map((date) => {
    const samples = coreSamples(seed, date, sourceId);
    const representative = samples[0] ?? representativeSnapshot(seed, date, sourceId);
    const average = averageCents(samples);
    return point(seed, representative, average === null ? null : yuan(average), '核心竞品均价');
  });

  const eventPoints = dates.map((date) => {
    const snapshot = representativeSnapshot(seed, date, sourceId);
    const event = eventForDate(seed, date);
    return point(seed, snapshot, 500 + (event?.lift ?? 0) * 10, '事件样本');
  });

  const series: TrendSeries[] = [
    { id: 'owner-rate', label: '本酒店价', colorVar: '--color-teal', points: ownerPoints },
    { id: 'core-average', label: '核心竞品均价', colorVar: '--color-violet', points: corePoints },
    { id: 'event-lift', label: '事件影响指数', colorVar: '--color-amber', points: eventPoints }
  ];

  return {
    series,
    events: buildEventMarkers(seed),
    yAxisUnit: 'CNY',
    sampleSize: seed.snapshots.filter((snapshot) => isAlertableSnapshot(snapshot) && sourceIds(seed).has(snapshot.rateKey.sourceId)).length
  };
}

function buildHeatmap(seed: DomainDemoSeed): { days: HeatmapDay[] } {
  const sourceId = primarySourceId(seed);
  const owner = ownerHotel(seed);
  const availableRows = displayDates(seed).map((date) => {
    const ownerSample = latestAvailableForHotelDateSource(seed, owner.hotelId, date, sourceId);
    const samples = coreSamples(seed, date, sourceId);
    const average = averageCents(samples);
    return {
      date,
      ownerRate: ownerSample ? yuan(ownerSample.priceCents) : null,
      coreAverage: average === null ? null : yuan(average),
      sampleSize: ownerSample && samples.length > 0 ? samples.length + 1 : 0
    };
  });
  const values = availableRows.flatMap((row) => (row.ownerRate !== null && row.coreAverage !== null ? [Math.abs(row.coreAverage - row.ownerRate)] : []));
  const maxGap = Math.max(...values, 1);

  return {
    days: availableRows.map((row) => {
      const event = eventForDate(seed, row.date);
      if (row.ownerRate === null || row.coreAverage === null || row.sampleSize === 0) {
        return {
          date: row.date,
          label: row.date.slice(5).replace('-', '/'),
          intensity: null,
          coreAverage: null,
          ownerRate: null,
          eventLabel: event?.label,
          sampleSize: 0,
          status: 'unavailable'
        };
      }

      return {
        date: row.date,
        label: row.date.slice(5).replace('-', '/'),
        intensity: Math.min(1, Math.max(0.12, Math.abs(row.coreAverage - row.ownerRate) / maxGap)),
        coreAverage: row.coreAverage,
        ownerRate: row.ownerRate,
        eventLabel: event?.label,
        sampleSize: row.sampleSize,
        status: event ? 'event-lift' : 'normal'
      };
    })
  };
}

function buildPlatformGaps(seed: DomainDemoSeed): DemoDataset['platformGaps'] {
  const owner = ownerHotel(seed);
  const coreCount = coreCompetitors(seed).length;
  const rows = seed.platforms.flatMap<PlatformGapRow>((platform) => {
    const ownerSample = latestAvailableForHotelDateSource(seed, owner.hotelId, seed.context.platformFocusDate, platform.sourceId);
    const samples = coreSamples(seed, seed.context.platformFocusDate, platform.sourceId);
    const average = averageCents(samples);

    if (!ownerSample || average === null) {
      return [];
    }

    const ownerRate = yuan(ownerSample.priceCents);
    const coreAverage = yuan(average);
    return [
      {
        platform: platform.label,
        ownerRate,
        coreAverage,
        gap: ownerRate - coreAverage,
        coverage: samples.length / Math.max(coreCount, 1)
      }
    ];
  });

  return {
    rows,
    maxGap: Math.max(...rows.map((row) => Math.abs(row.gap)), 1),
    unit: 'CNY'
  };
}

function eventImpactForDate(seed: DomainDemoSeed, date: string): CalendarEventImpact {
  const event = eventForDate(seed, date);
  return {
    label: event?.label ?? '普通工作日',
    type: event?.type ?? 'normal',
    lift: event?.lift ?? 0,
    confidence: event?.confidence ?? 'partial'
  };
}

function rateBasisForDate(seed: DomainDemoSeed, date: string): CalendarRateBasis {
  const sourceId = primarySourceId(seed);
  const snapshot = representativeSnapshot(seed, date, sourceId);
  const rateKey = uiRateKey(seed, snapshot);
  return {
    roomType: rateKey.roomType,
    occupancy: rateKey.occupancy,
    mealPlan: rateKey.mealPlan,
    taxFeeBasis: rateKey.taxFeeBasis,
    cancellationPolicy: rateKey.cancellationPolicy
  };
}

function latestCaptureTime(snapshots: RateSnapshot[]): string | null {
  return latestSnapshot(snapshots)?.capturedAt ?? null;
}

function calendarPlatformGapRows(seed: DomainDemoSeed, stayDate: string): CalendarPlatformGapRow[] {
  const owner = ownerHotel(seed);
  const coreCount = coreCompetitors(seed).length;

  return seed.platforms.map((platform) => {
    const ownerSample = latestAvailableForHotelDateSource(seed, owner.hotelId, stayDate, platform.sourceId);
    const samples = coreSamples(seed, stayDate, platform.sourceId);
    const average = averageCents(samples);
    const captureTime = latestCaptureTime([...(ownerSample ? [ownerSample] : []), ...samples]);

    if (!ownerSample || average === null) {
      return {
        platform: platform.label,
        ownerRate: null,
        coreAverage: null,
        gap: null,
        coverage: samples.length / Math.max(coreCount, 1),
        sampleSize: ownerSample ? samples.length + 1 : samples.length,
        captureTime,
        status: 'missing-sample'
      };
    }

    const ownerRate = yuan(ownerSample.priceCents);
    const coreAverage = yuan(average);
    return {
      platform: platform.label,
      ownerRate,
      coreAverage,
      gap: ownerRate - coreAverage,
      coverage: samples.length / Math.max(coreCount, 1),
      sampleSize: samples.length + 1,
      captureTime,
      status: 'available'
    };
  });
}

function marketOptionId(stayDate: string, sourceId: string): string {
  return `market-${stayDate}-${sourceId}`;
}

function marketSampleStatus(snapshot: RateSnapshot | undefined): MarketSampleStatus {
  if (!snapshot) {
    return 'missing-sample';
  }
  if (snapshot.availabilityStatus === 'available' && snapshot.priceCents !== null) {
    return 'available';
  }
  if (snapshot.availabilityStatus === 'stale') {
    return 'stale';
  }
  if (snapshot.availabilityStatus === 'source_error') {
    return 'source-error';
  }
  if (snapshot.availabilityStatus === 'no_rate') {
    return 'missing-sample';
  }
  return 'unavailable';
}

function marketSampleStatusLabel(status: MarketSampleStatus): string {
  const labels: Record<MarketSampleStatus, string> = {
    available: '可比样本',
    'missing-sample': '缺少可比样本',
    stale: '样本过期',
    unavailable: '暂不可售',
    'source-error': '来源样本暂不可用'
  };
  return labels[status];
}

function marketSampleExplanation(status: MarketSampleStatus): string {
  const explanations: Record<MarketSampleStatus, string> = {
    available: '该样本满足当前平台、入住日期、房型和价格口径。',
    'missing-sample': '暂无可比公开样本，需要等待人工导入或获授权来源补充。',
    stale: '样本已超过新鲜度阈值，不能作为有效价差判断。',
    unavailable: '该竞品当前样本暂不可售或不可比。',
    'source-error': '演示来源样本暂不可用，需要人工复核后再判断。'
  };
  return explanations[status];
}

function marketCompetitorSamples(seed: DomainDemoSeed, stayDate: string, sourceId: string, ownerRate: number | null): MarketCompetitorSample[] {
  return coreCompetitors(seed).map((hotel) => {
    const snapshot = latestForHotelDateSource(seed, hotel.hotelId, stayDate, sourceId);
    const status = marketSampleStatus(snapshot);
    const price = status === 'available' && snapshot?.priceCents !== null && snapshot?.priceCents !== undefined ? yuan(snapshot.priceCents) : null;
    const representative = snapshot ?? representativeSnapshot(seed, stayDate, sourceId);

    return {
      hotelId: hotel.hotelId,
      hotelName: hotel.name,
      competitorLevel: 'core',
      price,
      gapToOwner: ownerRate !== null && price !== null ? ownerRate - price : null,
      status,
      statusLabel: marketSampleStatusLabel(status),
      explanation: marketSampleExplanation(status),
      source: platformLabel(seed, sourceId),
      captureTime: snapshot?.capturedAt ?? null,
      rateKey: uiRateKey(seed, representative)
    };
  });
}

function marketCompetitorRange(samples: MarketCompetitorSample[]): MarketDrilldownDetail['competitorRange'] {
  const prices = samples.flatMap((sample) => (sample.price === null ? [] : [sample.price]));
  if (prices.length === 0) {
    return null;
  }
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}

function marketEvidenceMarkers(
  seed: DomainDemoSeed,
  detail: Pick<MarketDrilldownDetail, 'stayDate' | 'platform' | 'sampleSize' | 'captureTime' | 'status'>
): EvidenceMarker[] {
  if (detail.status === 'missing-sample') {
    return [
      {
        label: `暂无可比样本 · ${detail.stayDate}`,
        source: detail.platform,
        captureTime: detail.captureTime ?? detail.stayDate,
        sampleSize: 0,
        confidence: 'unavailable'
      }
    ];
  }

  return [
    {
      label: `本酒店观测 · ${seed.context.roomTypeKey} · ${detail.stayDate}`,
      source: detail.platform,
      captureTime: detail.captureTime ?? seed.now,
      sampleSize: 1,
      confidence: 'partial'
    },
    {
      label: `核心竞品样本 · ${seed.context.roomTypeKey} · ${detail.stayDate}`,
      source: detail.platform,
      captureTime: detail.captureTime ?? seed.now,
      sampleSize: Math.max(detail.sampleSize - 1, 0),
      confidence: detail.sampleSize >= 4 ? 'sample' : 'partial'
    }
  ];
}

function calendarEvidenceMarkers(seed: DomainDemoSeed, day: HeatmapDay, rows: CalendarPlatformGapRow[]): EvidenceMarker[] {
  const availableRows = rows.filter((row) => row.status === 'available');
  if (day.status === 'unavailable' || availableRows.length === 0) {
    return [
      {
        label: `暂无可比样本 · ${day.date}`,
        source: 'fixture 演示源',
        captureTime: day.date,
        sampleSize: 0,
        confidence: 'unavailable'
      }
    ];
  }

  const primaryRow = availableRows[0];
  const source = primaryRow.platform;
  const captureTime = primaryRow.captureTime ?? seed.now;
  return [
    {
      label: `本酒店观测 · ${seed.context.roomTypeKey} · ${day.date}`,
      source,
      captureTime,
      sampleSize: 1,
      confidence: 'partial'
    },
    {
      label: `核心竞品样本 · ${seed.context.roomTypeKey} · ${day.date}`,
      source,
      captureTime,
      sampleSize: Math.max(primaryRow.sampleSize - 1, 0),
      confidence: primaryRow.sampleSize >= 4 ? 'sample' : 'partial'
    }
  ];
}

function buildCalendarDetails(seed: DomainDemoSeed, heatmap: DemoDataset['heatmap']): DemoDataset['calendarDetails'] {
  const byDate = Object.fromEntries(
    heatmap.days.map((day): [string, CalendarDayDetail] => {
      const platformGaps = calendarPlatformGapRows(seed, day.date);
      const availableRows = platformGaps.filter((row) => row.status === 'available');
      const primaryAvailable = availableRows[0];
      const captureTime =
        primaryAvailable?.captureTime ??
        latestCaptureTime(seed.snapshots.filter((snapshot) => snapshot.rateKey.stayDate === day.date && sourceIds(seed).has(snapshot.rateKey.sourceId)));

      return [
        day.date,
        {
          stayDate: day.date,
          label: day.label,
          status: day.status,
          currency: 'CNY',
          ownerRate: day.ownerRate,
          coreAverage: day.coreAverage,
          gap: day.ownerRate !== null && day.coreAverage !== null ? day.ownerRate - day.coreAverage : null,
          sampleSize: day.sampleSize,
          eventImpact: eventImpactForDate(seed, day.date),
          platformGaps,
          evidenceMarkers: calendarEvidenceMarkers(seed, day, platformGaps),
          captureTime,
          rateBasis: rateBasisForDate(seed, day.date),
          missingSampleReason: day.status === 'unavailable' ? '暂无可比样本，需要等待人工导入或获授权来源补充。' : undefined,
          humanReviewRequired: true
        }
      ];
    })
  );

  return { byDate };
}

function buildMarketDrilldown(seed: DomainDemoSeed): DemoDataset['marketDrilldown'] {
  const owner = ownerHotel(seed);
  const coreCount = coreCompetitors(seed).length;
  const byId: Record<string, MarketDrilldownDetail> = {};
  const options: MarketDrilldownOption[] = [];

  for (const stayDate of displayDates(seed)) {
    for (const platform of seed.platforms) {
      const ownerSample = latestAvailableForHotelDateSource(seed, owner.hotelId, stayDate, platform.sourceId);
      const ownerRate = ownerSample ? yuan(ownerSample.priceCents) : null;
      const competitorSamples = marketCompetitorSamples(seed, stayDate, platform.sourceId, ownerRate);
      const availableCompetitors = competitorSamples.filter((sample) => sample.status === 'available' && sample.price !== null);
      const coreAverage =
        availableCompetitors.length === 0
          ? null
          : round(availableCompetitors.reduce((sum, sample) => sum + (sample.price ?? 0), 0) / availableCompetitors.length);
      const sampleSize = (ownerRate === null ? 0 : 1) + availableCompetitors.length;
      const status: MarketDrilldownDetail['status'] = ownerRate !== null && coreAverage !== null ? 'available' : 'missing-sample';
      const captureTime = latestCaptureTime([
        ...(ownerSample ? [ownerSample] : []),
        ...seed.snapshots.filter((snapshot) => snapshot.rateKey.stayDate === stayDate && snapshot.rateKey.sourceId === platform.sourceId)
      ]);

      const id = marketOptionId(stayDate, platform.sourceId);
      const detailBase = {
        id,
        platform: platform.label,
        stayDate,
        roomType: seed.context.roomTypeLabel,
        status,
        currency: 'CNY' as const,
        ownerRate,
        coreAverage,
        gap: ownerRate !== null && coreAverage !== null ? ownerRate - coreAverage : null,
        competitorRange: marketCompetitorRange(competitorSamples),
        coverage: availableCompetitors.length / Math.max(coreCount, 1),
        sampleSize,
        captureTime,
        eventImpact: eventImpactForDate(seed, stayDate),
        rateBasis: rateBasisForDate(seed, stayDate),
        competitorSamples,
        missingSampleReason: status === 'missing-sample' ? '暂无可比样本，需要等待人工导入或获授权来源补充。' : undefined,
        humanReviewRequired: true as const
      };
      const detail: MarketDrilldownDetail = {
        ...detailBase,
        evidenceMarkers: marketEvidenceMarkers(seed, detailBase)
      };

      byId[id] = detail;
      options.push({
        id,
        label: `${platform.label} · ${stayDate.slice(5).replace('-', '/')}`,
        platform: platform.label,
        stayDate,
        roomType: seed.context.roomTypeLabel,
        eventLabel: detail.eventImpact.label,
        status,
        gap: detail.gap,
        coverage: detail.coverage,
        sampleSize: detail.sampleSize
      });
    }
  }

  const preferredId = marketOptionId(seed.context.platformFocusDate, primarySourceId(seed));
  return {
    options,
    selectedOptionId: byId[preferredId] ? preferredId : (options[0]?.id ?? ''),
    byId,
    guardrails: ['本页仅使用 fixture/manual 演示数据。', '价差详情只作为人工复核线索。', '不保存状态，也不触发任何自动价格动作。']
  };
}

function alertPriority(alert: AlertCandidate): number {
  if (alert.alertType.startsWith('owner')) {
    return 0;
  }
  if (alert.alertType.startsWith('market')) {
    return 1;
  }
  return 2;
}

export function buildDomainDrivenDemoDataset(seed: DomainDemoSeed = domainSeed): DemoDataset {
  const normalizedSeed: DomainDemoSeed = {
    ...seed,
    snapshots: markStaleSnapshots(seed.snapshots, seed.now)
  };
  const heatmap = buildHeatmap(normalizedSeed);
  const alerts = generateAlertCandidates({
    hotels: normalizedSeed.hotels,
    snapshots: normalizedSeed.snapshots,
    now: normalizedSeed.now
  }).sort((a, b) => alertPriority(a) - alertPriority(b) || b.sampleSize - a.sampleSize || a.alertId.localeCompare(b.alertId));
  const signals = alerts.map((alert) => mapAlertToSignal(normalizedSeed, alert));

  return {
    sourceKind: 'fixture-demo',
    liveCollectionEnabled: false,
    demoDisclosure: '演示数据：本页仅使用静态样例，不连接真实平台或客户系统。',
    context: buildContext(normalizedSeed),
    dataScope: buildDataScopeSummary(normalizedSeed),
    captureEntry: buildCaptureEntryPreview(),
    trend: buildTrend(normalizedSeed),
    heatmap,
    calendarDetails: buildCalendarDetails(normalizedSeed, heatmap),
    platformGaps: buildPlatformGaps(normalizedSeed),
    marketDrilldown: buildMarketDrilldown(normalizedSeed),
    signals,
    alertReview: buildAlertReviewWorkflow(normalizedSeed, alerts, signals)
  };
}

export const domainDrivenDemoDataset = buildDomainDrivenDemoDataset(domainSeed);
