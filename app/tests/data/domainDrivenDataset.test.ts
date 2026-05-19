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
});
