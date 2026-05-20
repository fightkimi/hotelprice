import { describe, expect, it } from 'vitest';
import { buildDomainDrivenDemoDataset } from '../../src/data/domainDrivenDataset';
import { domainSeed } from '../../src/data/domainSeed';

describe('domain seed data', () => {
  it('contains one owner and at least three active core competitors in the same market', () => {
    const ownerHotels = domainSeed.hotels.filter((hotel) => hotel.role === 'owner' && hotel.active);
    const coreCompetitors = domainSeed.hotels.filter(
      (hotel) => hotel.role === 'competitor' && hotel.competitorLevel === 'core' && hotel.active
    );

    expect(ownerHotels).toHaveLength(1);
    expect(coreCompetitors.length).toBeGreaterThanOrEqual(3);
    expect(new Set(coreCompetitors.map((hotel) => hotel.ownerPropertyId))).toEqual(new Set([ownerHotels[0].ownerPropertyId]));
    expect(new Set(coreCompetitors.map((hotel) => hotel.competitorGroupId))).toEqual(new Set([ownerHotels[0].competitorGroupId]));
  });

  it('keeps snapshots fixture or manual and fully comparable', () => {
    for (const snapshot of domainSeed.snapshots) {
      expect(['fixture', 'manual']).toContain(snapshot.sourceKind);
      expect(snapshot.rateKey.channel).toBeTruthy();
      expect(snapshot.rateKey.sourceId).toBeTruthy();
      expect(snapshot.rateKey.stayDate).toMatch(/^2026-/);
      expect(snapshot.rateKey.checkoutDate).toMatch(/^2026-/);
      expect(snapshot.rateKey.currency).toBe('CNY');
      expect(snapshot.rateKey.occupancyAdults).toBeGreaterThan(0);
      expect(snapshot.rateKey.roomTypeKey).toBeTruthy();
      expect(snapshot.rateKey.mealPlan).toBeTruthy();
      expect(snapshot.rateKey.cancellationPolicy).toBeTruthy();
      expect(snapshot.rateKey.taxFeeBasis).toBeTruthy();
    }
  });

  it('includes unavailable samples and demo event annotations for UI missing states', () => {
    const statuses = new Set(domainSeed.snapshots.map((snapshot) => snapshot.availabilityStatus));
    const eventTypes = new Set(domainSeed.events.map((event) => event.type));

    expect(statuses.has('unavailable') || statuses.has('no_rate') || statuses.has('source_error')).toBe(true);
    expect(eventTypes).toEqual(new Set(['weekend', 'holiday', 'expo', 'concert']));
  });
});

describe('domain-driven demo dataset signals', () => {
  it('builds pricing-sensitive signals from domain alert candidates', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);

    expect(dataset.signals.length).toBeGreaterThan(0);
    expect(dataset.signals.every((signal) => signal.humanReviewRequired)).toBe(true);
    expect(dataset.signals.some((signal) => signal.id.includes('owner') || signal.id.includes('market') || signal.id.includes('competitor'))).toBe(
      true
    );
  });

  it('maps domain evidence into customer-safe evidence markers', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);

    for (const signal of dataset.signals) {
      expect(signal.evidenceMarkers.length).toBeGreaterThan(0);
      for (const marker of signal.evidenceMarkers) {
        expect(marker.source).toMatch(/演示源|fixture|manual/i);
        expect(marker.captureTime).toMatch(/^2026-/);
        expect(marker.sampleSize).toBeGreaterThan(0);
      }
    }
  });

  it('surfaces owner-position owner evidence separately from competitor samples', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);
    const ownerSignal = dataset.signals.find((signal) => signal.id.includes('owner_low_risk') || signal.id.includes('owner_high_risk'));

    expect(ownerSignal).toBeDefined();
    expect(ownerSignal?.humanReviewRequired).toBe(true);
    expect(ownerSignal?.evidenceMarkers.some((marker) => marker.label.startsWith('本酒店观测'))).toBe(true);
    expect(ownerSignal?.evidenceMarkers.filter((marker) => marker.label.startsWith('核心竞品样本')).length).toBeGreaterThanOrEqual(3);
  });
});

describe('domain-driven demo dataset charts', () => {
  it('builds trend series and platform gaps from comparable domain snapshots', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);

    expect(dataset.trend.series.map((series) => series.id)).toEqual(['owner-rate', 'core-average', 'event-lift']);
    expect(dataset.platformGaps.rows.length).toBeGreaterThanOrEqual(3);

    for (const series of dataset.trend.series) {
      for (const point of series.points) {
        expect(point.currency).toBe('CNY');
        expect(point.rateKey.roomType).toBe(dataset.context.roomType);
        expect(point.rateKey.competitorGroupId).toBeTruthy();
        expect(point.taxFeeBasis).toBeTruthy();
        expect(point.cancellationPolicy).toBeTruthy();
      }
    }

    for (const row of dataset.platformGaps.rows) {
      expect(row.platform).toMatch(/演示源/);
      expect(row.coverage).toBeGreaterThan(0);
      expect(row.coverage).toBeLessThanOrEqual(1);
    }
  });

  it('renders unavailable source states as null values rather than zero prices', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);
    const unavailableDays = dataset.heatmap.days.filter((day) => day.status === 'unavailable');

    expect(unavailableDays.length).toBeGreaterThan(0);
    for (const day of unavailableDays) {
      expect(day.intensity).toBeNull();
      expect(day.ownerRate).toBeNull();
      expect(day.coreAverage).toBeNull();
      expect(day.sampleSize).toBe(0);
    }

    const allPointValues = dataset.trend.series.flatMap((series) => series.points.map((point) => point.value));
    expect(allPointValues).not.toContain(0);
  });

  it('applies freshness stale rules before building trend, heatmap, and platform gap UI data', () => {
    const staleSeed = {
      ...domainSeed,
      snapshots: domainSeed.snapshots.map((snapshot) =>
        snapshot.snapshotId === 'owner-0524-ctrip-latest' || snapshot.snapshotId === 'owner-0531-ctrip-latest'
          ? { ...snapshot, capturedAt: '2026-05-17T20:00:00.000Z' }
          : snapshot
      )
    };
    const dataset = buildDomainDrivenDemoDataset(staleSeed);
    const ownerSeries = dataset.trend.series.find((series) => series.id === 'owner-rate');
    const staleTrendPoint = ownerSeries?.points.find((point) => point.date === '2026-05-24');
    const staleHeatmapDay = dataset.heatmap.days.find((day) => day.date === '2026-05-24');
    const stalePlatformRow = dataset.platformGaps.rows.find((row) => row.platform === '携程演示源');

    expect(staleTrendPoint?.value).toBeNull();
    expect(staleHeatmapDay).toMatchObject({
      status: 'unavailable',
      intensity: null,
      ownerRate: null,
      coreAverage: null,
      sampleSize: 0
    });
    expect(stalePlatformRow).toBeUndefined();
  });
});

describe('domain-driven calendar details', () => {
  it('builds one calendar detail for every heatmap day with review evidence', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);
    const detailDates = Object.keys(dataset.calendarDetails.byDate).sort();

    expect(detailDates).toEqual(dataset.heatmap.days.map((day) => day.date).sort());

    const concertDetail = dataset.calendarDetails.byDate['2026-05-31'];
    expect(concertDetail).toMatchObject({
      stayDate: '2026-05-31',
      label: '05/31',
      status: 'event-lift',
      currency: 'CNY',
      humanReviewRequired: true,
      eventImpact: expect.objectContaining({
        label: '演唱会演示日',
        type: 'concert',
        confidence: 'partial'
      }),
      rateBasis: expect.objectContaining({
        roomType: dataset.context.roomType,
        occupancy: 2,
        mealPlan: '双早',
        taxFeeBasis: '含税含服务费',
        cancellationPolicy: '入住前24小时可取消'
      })
    });
    expect(concertDetail.ownerRate).toBeGreaterThan(0);
    expect(concertDetail.coreAverage).toBeGreaterThan(0);
    expect(concertDetail.gap).toBe(concertDetail.ownerRate! - concertDetail.coreAverage!);
    expect(concertDetail.platformGaps).toHaveLength(4);
    expect(concertDetail.platformGaps.some((row) => row.platform === '携程演示源' && row.status === 'available')).toBe(true);
    expect(concertDetail.evidenceMarkers.length).toBeGreaterThanOrEqual(2);
    expect(concertDetail.evidenceMarkers.some((marker) => marker.label.startsWith('本酒店观测'))).toBe(true);
    expect(concertDetail.evidenceMarkers.some((marker) => marker.label.startsWith('核心竞品样本'))).toBe(true);
  });

  it('keeps unavailable calendar details as missing samples rather than zero prices', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);
    const unavailableDetail = dataset.calendarDetails.byDate['2026-05-27'];

    expect(unavailableDetail).toMatchObject({
      stayDate: '2026-05-27',
      status: 'unavailable',
      ownerRate: null,
      coreAverage: null,
      gap: null,
      sampleSize: 0,
      missingSampleReason: '暂无可比样本，需要等待人工导入或获授权来源补充。',
      humanReviewRequired: true
    });
    expect(unavailableDetail.platformGaps.every((row) => row.status === 'missing-sample')).toBe(true);
    expect(unavailableDetail.platformGaps.every((row) => row.ownerRate === null && row.coreAverage === null && row.gap === null)).toBe(true);
    expect(unavailableDetail.evidenceMarkers.every((marker) => marker.confidence === 'unavailable')).toBe(true);
  });
});

describe('domain-driven data scope and capture entry', () => {
  it('derives scope boundaries from domain seed hotels and snapshots', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);

    expect(dataset.dataScope.ownerPropertyId).toBe(domainSeed.context.ownerPropertyId);
    expect(dataset.dataScope.ownerHotelId).toBe(domainSeed.context.ownerHotelId);
    expect(dataset.dataScope.competitorGroupId).toBe(domainSeed.context.competitorGroupId);
    expect(dataset.dataScope.competitorCoverage.coreCount).toBeGreaterThanOrEqual(3);
    expect(dataset.dataScope.platforms.map((platform) => platform.label)).toEqual(domainSeed.platforms.map((platform) => platform.label));
    expect(dataset.dataScope.stayWindow).toMatchObject({
      startDate: '2026-05-24',
      endDate: '2026-06-02',
      focusDate: domainSeed.context.platformFocusDate
    });
    expect(dataset.dataScope.freshness.staleAfterHours).toBe(36);
  });

  it('keeps capture entry local, review-gated, and production-disabled', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);

    expect(dataset.captureEntry.productionConnectionEnabled).toBe(false);
    expect(dataset.captureEntry.options).toEqual([
      expect.objectContaining({ id: 'fixture-demo', status: 'active', sourceKind: 'fixture', humanReviewRequired: true }),
      expect.objectContaining({ id: 'manual-import', status: 'available', sourceKind: 'manual', humanReviewRequired: true }),
      expect.objectContaining({ id: 'approved-api', status: 'requires-approval', sourceKind: 'approved_api', humanReviewRequired: true })
    ]);
  });
});
