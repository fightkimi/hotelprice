import { generateAlertCandidates, isAlertableSnapshot, markStaleSnapshots } from '../domain/pricing';
import type { AlertCandidate, AlertableRateSnapshot, HotelProfile, RateSnapshot } from '../domain/pricing';
import type {
  ContextSelection,
  DemoDataset,
  EventMarker,
  EvidenceMarker,
  HeatmapDay,
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
  const alerts = generateAlertCandidates({
    hotels: normalizedSeed.hotels,
    snapshots: normalizedSeed.snapshots,
    now: normalizedSeed.now
  }).sort((a, b) => alertPriority(a) - alertPriority(b) || b.sampleSize - a.sampleSize || a.alertId.localeCompare(b.alertId));

  return {
    sourceKind: 'fixture-demo',
    liveCollectionEnabled: false,
    demoDisclosure: '演示数据：本页仅使用静态样例，不连接真实平台或客户系统。',
    context: buildContext(normalizedSeed),
    dataScope: buildDataScopeSummary(normalizedSeed),
    captureEntry: buildCaptureEntryPreview(),
    trend: buildTrend(normalizedSeed),
    heatmap: buildHeatmap(normalizedSeed),
    platformGaps: buildPlatformGaps(normalizedSeed),
    signals: alerts.map((alert) => mapAlertToSignal(normalizedSeed, alert))
  };
}

export const domainDrivenDemoDataset = buildDomainDrivenDemoDataset(domainSeed);
