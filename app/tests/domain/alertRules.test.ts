import { describe, expect, it } from 'vitest';
import { generateAlertCandidates } from '../../src/domain/pricing';
import type { ComparableRateKey, HotelProfile, RateSnapshot } from '../../src/domain/pricing';

const key: ComparableRateKey = {
  channel: 'ctrip_fixture',
  sourceId: 'ctrip-demo',
  stayDate: '2026-06-01',
  checkoutDate: '2026-06-02',
  currency: 'CNY',
  occupancyAdults: 2,
  roomTypeKey: 'std-king',
  mealPlan: 'double-breakfast',
  cancellationPolicy: 'free-cancel-24h',
  taxFeeBasis: 'included'
};

const otherRoomKey: ComparableRateKey = {
  ...key,
  roomTypeKey: 'deluxe-king'
};

const hotels: HotelProfile[] = [
  { hotelId: 'owner', ownerPropertyId: 'owner-westlake', name: 'Owner', role: 'owner', competitorLevel: 'owner', competitorGroupId: 'core-westlake', active: true },
  { hotelId: 'comp-a', ownerPropertyId: 'owner-westlake', name: 'A', role: 'competitor', competitorLevel: 'core', competitorGroupId: 'core-westlake', active: true },
  { hotelId: 'comp-b', ownerPropertyId: 'owner-westlake', name: 'B', role: 'competitor', competitorLevel: 'core', competitorGroupId: 'core-westlake', active: true },
  { hotelId: 'comp-c', ownerPropertyId: 'owner-westlake', name: 'C', role: 'competitor', competitorLevel: 'core', competitorGroupId: 'core-westlake', active: true },
  { hotelId: 'comp-ref', ownerPropertyId: 'owner-westlake', name: 'Reference', role: 'competitor', competitorLevel: 'reference', competitorGroupId: 'core-westlake', active: true },
  { hotelId: 'comp-off', ownerPropertyId: 'owner-westlake', name: 'Inactive', role: 'competitor', competitorLevel: 'core', competitorGroupId: 'core-westlake', active: false }
];

function snap(
  snapshotId: string,
  hotelId: string,
  capturedAt: string,
  priceCents: number | null,
  rateKey: ComparableRateKey = key,
  availabilityStatus: RateSnapshot['availabilityStatus'] = 'available'
): RateSnapshot {
  return {
    snapshotId,
    hotelId,
    ownerPropertyId: 'owner-westlake',
    competitorGroupId: 'core-westlake',
    capturedAt,
    sourceKind: 'fixture',
    availabilityStatus,
    unavailableReason: availabilityStatus === 'available' ? null : availabilityStatus,
    priceCents,
    rateKey
  };
}

function generate(snapshots: RateSnapshot[]) {
  return generateAlertCandidates({ hotels, snapshots, now: '2026-05-19T20:00:00.000Z' });
}

describe('alert candidate rules', () => {
  it('emits competitor increase at +10 percent for the same hotel and comparable key', () => {
    const alerts = generate([
      snap('a1', 'comp-a', '2026-05-19T08:00:00.000Z', 40000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 44000)
    ]);

    expect(alerts).toEqual([
      expect.objectContaining({
        alertType: 'competitor_increase',
        hotelId: 'comp-a',
        oldPriceCents: 40000,
        newPriceCents: 44000,
        changeRate: 0.1,
        requiresHumanReview: true
      })
    ]);
  });

  it('emits competitor decrease at -10 percent for the same hotel and comparable key', () => {
    const alerts = generate([
      snap('a1', 'comp-a', '2026-05-19T08:00:00.000Z', 50000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 45000)
    ]);

    expect(alerts[0]).toEqual(expect.objectContaining({ alertType: 'competitor_decrease', changeRate: -0.1 }));
  });

  it('suppresses movement below threshold and when latest is unavailable', () => {
    const smallMove = generate([
      snap('a1', 'comp-a', '2026-05-19T08:00:00.000Z', 40000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 42000)
    ]);
    const unavailableLatest = generate([
      snap('b1', 'comp-b', '2026-05-19T08:00:00.000Z', 40000),
      snap('b2', 'comp-b', '2026-05-19T12:00:00.000Z', null, key, 'unavailable')
    ]);

    expect(smallMove).toHaveLength(0);
    expect(unavailableLatest).toHaveLength(0);
  });

  it('does not compare different hotels with the same comparable key', () => {
    const alerts = generate([
      snap('a1', 'comp-a', '2026-05-19T08:00:00.000Z', 40000),
      snap('b1', 'comp-b', '2026-05-19T12:00:00.000Z', 48000)
    ]);

    expect(alerts).toHaveLength(0);
  });

  it('emits market movement only when three active core competitors are available at both capture times', () => {
    const qualified = generate([
      snap('a1', 'comp-a', '2026-05-19T08:00:00.000Z', 40000),
      snap('b1', 'comp-b', '2026-05-19T08:00:00.000Z', 50000),
      snap('c1', 'comp-c', '2026-05-19T08:00:00.000Z', 60000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 44000),
      snap('b2', 'comp-b', '2026-05-19T12:00:00.000Z', 55000),
      snap('c2', 'comp-c', '2026-05-19T12:00:00.000Z', 66000)
    ]);
    const underSampled = generate([
      snap('a1', 'comp-a', '2026-05-19T08:00:00.000Z', 40000),
      snap('b1', 'comp-b', '2026-05-19T08:00:00.000Z', 50000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 44000),
      snap('b2', 'comp-b', '2026-05-19T12:00:00.000Z', 55000)
    ]);

    expect(qualified.some((alert) => alert.alertType === 'market_increase' && alert.sampleSize === 3)).toBe(true);
    expect(underSampled.some((alert) => alert.alertType === 'market_increase')).toBe(false);
  });

  it('emits owner low and high risk only against exact comparable core competitor rates', () => {
    const lowRisk = generate([
      snap('owner-1', 'owner', '2026-05-19T12:00:00.000Z', 30000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 50000),
      snap('b2', 'comp-b', '2026-05-19T12:00:00.000Z', 50000),
      snap('c2', 'comp-c', '2026-05-19T12:00:00.000Z', 50000),
      snap('ref-2', 'comp-ref', '2026-05-19T12:00:00.000Z', 10000),
      snap('other-room', 'comp-a', '2026-05-19T12:00:00.000Z', 30000, otherRoomKey)
    ]);
    const highRisk = generate([
      snap('owner-1', 'owner', '2026-05-19T12:00:00.000Z', 65000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 50000),
      snap('b2', 'comp-b', '2026-05-19T12:00:00.000Z', 50000),
      snap('c2', 'comp-c', '2026-05-19T12:00:00.000Z', 50000)
    ]);

    expect(lowRisk.some((alert) => alert.alertType === 'owner_low_risk' && alert.sampleSize === 3)).toBe(true);
    expect(highRisk.some((alert) => alert.alertType === 'owner_high_risk' && alert.sampleSize === 3)).toBe(true);
  });

  it('includes human-review evidence and never emits a recommended new price', () => {
    const [alert] = generate([
      snap('a1', 'comp-a', '2026-05-19T08:00:00.000Z', 40000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 44000)
    ]);

    expect(alert.requiresHumanReview).toBe(true);
    expect(alert.evidence[0]).toEqual(expect.objectContaining({
      sourceKind: 'fixture',
      capturedAt: '2026-05-19T12:00:00.000Z',
      hotelId: 'comp-a',
      sampleSize: 1
    }));
    expect(alert).not.toHaveProperty('recommendedPriceCents');
  });
});
