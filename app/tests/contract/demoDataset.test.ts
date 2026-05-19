import { describe, expect, it } from 'vitest';
import { demoDataset } from '../../src/data/demoDataset';

describe('demo dataset boundaries', () => {
  it('marks data as fixture/demo and not live collection', () => {
    expect(demoDataset.sourceKind).toBe('fixture-demo');
    expect(demoDataset.liveCollectionEnabled).toBe(false);
    expect(demoDataset.demoDisclosure).toContain('演示');
  });

  it('keeps every rate point comparable with explicit basis', () => {
    for (const series of demoDataset.trend.series) {
      for (const point of series.points) {
        expect(point.rateKey.hotelId).toBeTruthy();
        expect(point.rateKey.roomType).toBeTruthy();
        expect(point.rateKey.platform).toBeTruthy();
        expect(point.currency).toBe('CNY');
        expect(point.taxFeeBasis).toBeTruthy();
        expect(point.occupancy).toBeGreaterThan(0);
        expect(point.mealPlan).toBeTruthy();
        expect(point.cancellationPolicy).toBeTruthy();
        expect(point.captureTime).toMatch(/^2026-/);
      }
    }
  });

  it('requires human review markers for pricing-sensitive signals', () => {
    for (const signal of demoDataset.signals) {
      expect(signal.humanReviewRequired).toBe(true);
      expect(signal.evidenceMarkers.length).toBeGreaterThan(0);
    }
  });
});
